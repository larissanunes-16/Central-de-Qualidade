import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegraNegocioError, assertPodeIniciarAnalise } from "@/lib/stateMachine";
import { gerarRelatorioMock } from "@/lib/ai/mockAnalysis";
import { gerarLayoutSugeridoMock } from "@/lib/ai/mockLayout";

// RN-08: a análise só é iniciada mediante ação explícita do usuário.
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const servico = await db.servico.findUnique({
    where: { id: params.id },
    include: {
      secretaria: true,
      comentarios: true,
      ciclos: { orderBy: { versao: "desc" }, take: 1, include: { documentos: true } },
    },
  });
  if (!servico) return NextResponse.json({ erro: "Serviço não encontrado." }, { status: 404 });

  const ciclo = servico.ciclos[0];
  if (!ciclo) return NextResponse.json({ erro: "Nenhum ciclo em andamento para este serviço." }, { status: 400 });

  try {
    assertPodeIniciarAnalise({
      quantidadeDocumentos: ciclo.documentos.length,
      nome: servico.nome,
      secretariaId: servico.secretariaId,
      responsavelAnalise: ciclo.responsavelAnalise,
    });

    const relatorioGerado = await gerarRelatorioMock({
      servicoNome: servico.nome,
      secretariaNome: servico.secretaria.nome,
      documentos: ciclo.documentos.map((d) => ({ nome: d.nome })),
      contextoAdicional: ciclo.contextoAdicional,
      comentariosOuvidoria: servico.comentarios.map((c) => ({ texto: c.texto })),
      seed: ciclo.id,
    });
    const layoutSugerido = servico.origem === "CRIADO_NOVO" ? gerarLayoutSugeridoMock(servico.nome, ciclo.id) : null;

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
        layoutSugerido: layoutSugerido ? JSON.stringify(layoutSugerido) : null,
      },
      update: {
        jornada: JSON.stringify(relatorioGerado.jornada),
        pontosFalha: JSON.stringify(relatorioGerado.pontosFalha),
        momentosVerdade: JSON.stringify(relatorioGerado.momentosVerdade),
        matrizPriorizacao: JSON.stringify(relatorioGerado.pontosFalha),
        recomendacoes: JSON.stringify(relatorioGerado.recomendacoes),
        layoutSugerido: layoutSugerido ? JSON.stringify(layoutSugerido) : null,
      },
    });
    await db.servico.update({ where: { id: servico.id }, data: { estado: "EM_ANALISE" } });

    return NextResponse.json({ cicloId: ciclo.id });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
