import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegraNegocioError, assertPodeGerarAnalisePreditiva } from "@/lib/stateMachine";
import { gerarAnalisePreditivaMock } from "@/lib/ai/mockPredictiveAnalysis";
import { gerarLayoutSugeridoMock } from "@/lib/ai/mockLayout";

// Gera (ou regera) a Análise de Riscos Previstos do ciclo preditivo atual.
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const servico = await db.servico.findUnique({
    where: { id: params.id },
    include: {
      secretaria: true,
      ciclos: { orderBy: { versao: "desc" }, take: 1 },
    },
  });
  if (!servico) return NextResponse.json({ erro: "Serviço não encontrado." }, { status: 404 });

  const ciclo = servico.ciclos[0];
  if (!ciclo || ciclo.tipo !== "PREDITIVO") {
    return NextResponse.json({ erro: "Nenhum ciclo de planejamento em andamento para este serviço." }, { status: 400 });
  }

  try {
    const etapasPrevistas: string[] = ciclo.etapasPrevistas ? JSON.parse(ciclo.etapasPrevistas) : [];
    const canaisPrevistos: string[] = ciclo.canaisPrevistos ? JSON.parse(ciclo.canaisPrevistos) : [];

    assertPodeGerarAnalisePreditiva({
      nome: servico.nome,
      secretariaId: servico.secretariaId,
      responsavelAnalise: ciclo.responsavelAnalise,
      objetivoServico: ciclo.objetivoServico,
      publicoAlvo: ciclo.publicoAlvo,
      quantidadeEtapasPrevistas: etapasPrevistas.length,
    });

    const relatorioGerado = await gerarAnalisePreditivaMock({
      servicoNome: servico.nome,
      secretariaNome: servico.secretaria.nome,
      objetivoServico: ciclo.objetivoServico ?? "",
      publicoAlvo: ciclo.publicoAlvo ?? "",
      etapasPrevistas,
      canaisPrevistos,
      integracoesPrevistas: ciclo.integracoesPrevistas,
      seed: ciclo.id,
    });
    const layoutSugerido = gerarLayoutSugeridoMock(servico.nome, ciclo.id);

    await db.ciclo.update({ where: { id: ciclo.id }, data: { analiseIniciadaEm: new Date(), falhaProcessamento: false } });
    await db.relatorio.upsert({
      where: { cicloId: ciclo.id },
      create: {
        cicloId: ciclo.id,
        jornada: JSON.stringify(relatorioGerado.jornada),
        pontosFalha: JSON.stringify(relatorioGerado.pontosFalha),
        momentosVerdade: JSON.stringify(relatorioGerado.momentosVerdade),
        matrizPriorizacao: JSON.stringify(relatorioGerado.pontosFalha),
        recomendacoes: JSON.stringify(relatorioGerado.recomendacoes),
        layoutSugerido: JSON.stringify(layoutSugerido),
      },
      update: {
        jornada: JSON.stringify(relatorioGerado.jornada),
        pontosFalha: JSON.stringify(relatorioGerado.pontosFalha),
        momentosVerdade: JSON.stringify(relatorioGerado.momentosVerdade),
        matrizPriorizacao: JSON.stringify(relatorioGerado.pontosFalha),
        recomendacoes: JSON.stringify(relatorioGerado.recomendacoes),
        layoutSugerido: JSON.stringify(layoutSugerido),
      },
    });
    await db.servico.update({ where: { id: servico.id }, data: { estado: "ANALISE_PREDITIVA" } });

    return NextResponse.json({ cicloId: ciclo.id });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
