import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegraNegocioError, assertPodeLancarServico } from "@/lib/stateMachine";

// Conclui o ciclo preditivo (arquiva no histórico) e inicia o primeiro ciclo
// diagnóstico do serviço, agora em operação — reaproveitando o fluxo normal
// de importação de evidências já existente.
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const servico = await db.servico.findUnique({
    where: { id: params.id },
    include: { ciclos: { orderBy: { versao: "desc" }, take: 1, include: { relatorio: true } } },
  });
  if (!servico) return NextResponse.json({ erro: "Serviço não encontrado." }, { status: 404 });

  const ciclo = servico.ciclos[0];
  if (!ciclo || ciclo.tipo !== "PREDITIVO") {
    return NextResponse.json({ erro: "Este serviço não está em análise preditiva." }, { status: 400 });
  }

  try {
    assertPodeLancarServico({ relatorioExiste: Boolean(ciclo.relatorio) });

    await db.ciclo.update({
      where: { id: ciclo.id },
      data: { dataConclusao: new Date(), membrosParticipantes: JSON.stringify([ciclo.responsavelAnalise]) },
    });

    const novoCiclo = await db.ciclo.create({
      data: {
        servicoId: servico.id,
        versao: ciclo.versao + 1,
        tipo: "DIAGNOSTICO",
        responsavelAnalise: ciclo.responsavelAnalise,
      },
    });

    await db.servico.update({
      where: { id: servico.id },
      data: { estado: "AGUARDANDO_ANALISE", versaoAtual: ciclo.versao },
    });

    return NextResponse.json({ servicoId: servico.id, cicloId: novoCiclo.id });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
