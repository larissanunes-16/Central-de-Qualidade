import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gerarComparativoMock } from "@/lib/ai/mockComparativo";

// Gera uma sugestão de comparativo antes/depois (RN-25) a partir dos pontos de
// falha do relatório aceito e das melhorias já concluídas neste ciclo. O
// analista pode editar o texto antes de confirmar a conclusão do ciclo.
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const ciclo = await db.ciclo.findUnique({
    where: { id: params.id },
    include: { relatorio: true, cards: true, servico: true },
  });
  if (!ciclo) return NextResponse.json({ erro: "Ciclo não encontrado." }, { status: 404 });

  const pontosFalha = ciclo.relatorio ? JSON.parse(ciclo.relatorio.pontosFalha) : [];
  const cardsConcluidos = ciclo.cards
    .filter((c) => c.estado === "CONCLUIDO")
    .map((c) => ({ titulo: c.titulo, categoria: c.categoria }));

  const sugestao = gerarComparativoMock({
    servicoNome: ciclo.servico.nome,
    pontosFalha,
    cardsConcluidos,
  });

  return NextResponse.json(sugestao);
}
