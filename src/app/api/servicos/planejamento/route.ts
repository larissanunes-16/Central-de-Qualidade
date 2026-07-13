import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegraNegocioError, assertPodeGerarAnalisePreditiva } from "@/lib/stateMachine";
import { gerarAnalisePreditivaMock } from "@/lib/ai/mockPredictiveAnalysis";
import { gerarLayoutSugeridoMock } from "@/lib/ai/mockLayout";

// Cria um serviço no fluxo de "está sendo criado": nasce em PLANEJAMENTO,
// com um ciclo tipo=PREDITIVO preenchido pelo formulário guiado (sem upload
// de documentos). Se `gerarAnalise` vier true, já gera a análise preditiva.
export async function POST(request: Request) {
  const body = await request.json();
  const nome = String(body.nome ?? "").trim();
  const secretariaId = String(body.secretariaId ?? "").trim();
  const responsavelAnalise = String(body.responsavelAnalise ?? "").trim();
  const objetivoServico = String(body.objetivoServico ?? "").trim();
  const publicoAlvo = String(body.publicoAlvo ?? "").trim();
  const etapasPrevistas: string[] = Array.isArray(body.etapasPrevistas)
    ? body.etapasPrevistas.map((e: unknown) => String(e).trim()).filter(Boolean)
    : [];
  const canaisPrevistos: string[] = Array.isArray(body.canaisPrevistos)
    ? body.canaisPrevistos.map((c: unknown) => String(c).trim()).filter(Boolean)
    : [];
  const integracoesPrevistas = body.integracoesPrevistas ? String(body.integracoesPrevistas).trim() : null;
  const gerarAnalise = Boolean(body.gerarAnalise);

  if (!nome) return NextResponse.json({ erro: "Informe o nome do serviço." }, { status: 400 });
  if (!secretariaId) return NextResponse.json({ erro: "Selecione a secretaria responsável." }, { status: 400 });

  const secretaria = await db.secretaria.findUnique({ where: { id: secretariaId } });
  if (!secretaria) return NextResponse.json({ erro: "Secretaria não encontrada." }, { status: 400 });

  try {
    const servico = await db.servico.create({
      data: { nome, secretariaId, origem: "CRIADO_NOVO", estado: "PLANEJAMENTO", versaoAtual: 0 },
    });

    const ciclo = await db.ciclo.create({
      data: {
        servicoId: servico.id,
        versao: 1,
        tipo: "PREDITIVO",
        responsavelAnalise,
        objetivoServico,
        publicoAlvo,
        etapasPrevistas: JSON.stringify(etapasPrevistas),
        canaisPrevistos: JSON.stringify(canaisPrevistos),
        integracoesPrevistas,
      },
    });

    if (gerarAnalise) {
      assertPodeGerarAnalisePreditiva({
        nome,
        secretariaId,
        responsavelAnalise,
        objetivoServico,
        publicoAlvo,
        quantidadeEtapasPrevistas: etapasPrevistas.length,
      });

      const relatorioGerado = await gerarAnalisePreditivaMock({
        servicoNome: nome,
        secretariaNome: secretaria.nome,
        objetivoServico,
        publicoAlvo,
        etapasPrevistas,
        canaisPrevistos,
        integracoesPrevistas,
        seed: ciclo.id,
      });
      const layoutSugerido = gerarLayoutSugeridoMock(nome, ciclo.id);

      await db.ciclo.update({ where: { id: ciclo.id }, data: { analiseIniciadaEm: new Date() } });
      await db.relatorio.create({
        data: {
          cicloId: ciclo.id,
          jornada: JSON.stringify(relatorioGerado.jornada),
          pontosFalha: JSON.stringify(relatorioGerado.pontosFalha),
          momentosVerdade: JSON.stringify(relatorioGerado.momentosVerdade),
          matrizPriorizacao: JSON.stringify(relatorioGerado.pontosFalha),
          recomendacoes: JSON.stringify(relatorioGerado.recomendacoes),
          layoutSugerido: JSON.stringify(layoutSugerido),
        },
      });
      await db.servico.update({ where: { id: servico.id }, data: { estado: "ANALISE_PREDITIVA" } });
    }

    return NextResponse.json({ id: servico.id, cicloId: ciclo.id }, { status: 201 });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
