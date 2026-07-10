import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cicloParaJson } from "@/lib/serialize";
import { DURACAO_SIMULACAO_ANALISE_MS } from "@/lib/constants";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const ciclo = await db.ciclo.findUnique({
    where: { id: params.id },
    include: {
      documentos: true,
      relatorio: true,
      cards: true,
      servico: { include: { secretaria: true } },
    },
  });
  if (!ciclo) return NextResponse.json({ erro: "Ciclo não encontrado." }, { status: 404 });

  const elapsed = ciclo.analiseIniciadaEm ? Date.now() - ciclo.analiseIniciadaEm.getTime() : 0;
  const processando = Boolean(ciclo.analiseIniciadaEm) && elapsed < DURACAO_SIMULACAO_ANALISE_MS;
  const percentualEstimado = ciclo.analiseIniciadaEm
    ? Math.min(100, Math.round((elapsed / DURACAO_SIMULACAO_ANALISE_MS) * 100))
    : 0;

  return NextResponse.json({
    ...cicloParaJson(ciclo),
    servico: {
      id: ciclo.servico.id,
      nome: ciclo.servico.nome,
      estado: ciclo.servico.estado,
      origem: ciclo.servico.origem,
      secretaria: ciclo.servico.secretaria,
    },
    processando,
    percentualEstimado,
  });
}
