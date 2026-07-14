import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salvarComparativoSchema } from "@/lib/validation";
import { RegraNegocioError, assertPodeConcluirCiclo, assertUsuarioEhGestor } from "@/lib/stateMachine";

// RN-21/22/23: só conclui com 100% dos cards concluídos; registra data, versão e membros.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = salvarComparativoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const usuarioAtualId = typeof body.usuarioAtualId === "string" ? body.usuarioAtualId : null;

  const ciclo = await db.ciclo.findUnique({
    where: { id: params.id },
    include: { cards: true, servico: true },
  });
  if (!ciclo) return NextResponse.json({ erro: "Ciclo não encontrado." }, { status: 404 });

  const usuarioAtual = usuarioAtualId ? await db.usuario.findUnique({ where: { id: usuarioAtualId } }) : null;

  try {
    // Apenas um gestor pode concluir o ciclo (o card em si pode ser concluído por qualquer analista ou gestor).
    assertUsuarioEhGestor({ papel: usuarioAtual?.papel });

    const cardsConcluidos = ciclo.cards.filter((c) => c.estado === "CONCLUIDO").length;
    assertPodeConcluirCiclo({ totalCards: ciclo.cards.length, cardsConcluidos });

    const membros = new Set<string>([ciclo.responsavelAnalise]);
    ciclo.cards.forEach((c) => c.responsavel && membros.add(c.responsavel));
    if (usuarioAtual) membros.add(usuarioAtual.nome);

    await db.ciclo.update({
      where: { id: ciclo.id },
      data: {
        dataConclusao: new Date(),
        comparativoAntes: parsed.data.comparativoAntes,
        comparativoDepois: parsed.data.comparativoDepois,
        membrosParticipantes: JSON.stringify(Array.from(membros)),
      },
    });
    await db.servico.update({
      where: { id: ciclo.servicoId },
      data: { estado: "CONCLUIDO", versaoAtual: ciclo.versao },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
