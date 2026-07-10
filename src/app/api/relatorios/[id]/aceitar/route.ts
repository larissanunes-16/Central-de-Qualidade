import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// RN-15/RN-16: aceitar o relatório converte cada recomendação em um card de melhoria
// e avança o serviço para "Em melhoria".
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const relatorio = await db.relatorio.findUnique({
    where: { id: params.id },
    include: { ciclo: { include: { cards: true } } },
  });
  if (!relatorio) return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });

  if (relatorio.ciclo.cards.length === 0) {
    const recomendacoes = JSON.parse(relatorio.recomendacoes) as { id: string; titulo: string; categoria: string }[];
    await db.cardMelhoria.createMany({
      data: recomendacoes.map((rec) => ({
        cicloId: relatorio.cicloId,
        recomendacaoRef: rec.id,
        titulo: rec.titulo,
        categoria: rec.categoria,
        estado: "PENDENTE",
      })),
    });
  }

  await db.servico.update({ where: { id: relatorio.ciclo.servicoId }, data: { estado: "EM_MELHORIA" } });

  return NextResponse.json({ servicoId: relatorio.ciclo.servicoId });
}
