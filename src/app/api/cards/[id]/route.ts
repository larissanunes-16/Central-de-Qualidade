import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moverCardSchema } from "@/lib/validation";
import { RegraNegocioError, assertCardNaoRevertido, assertPodeMoverCardParaAndamento } from "@/lib/stateMachine";
import { cardParaJson } from "@/lib/serialize";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = moverCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const card = await db.cardMelhoria.findUnique({ where: { id: params.id } });
  if (!card) return NextResponse.json({ erro: "Card não encontrado." }, { status: 404 });

  const usuarioAtual = await db.usuario.findUnique({ where: { id: parsed.data.usuarioAtualId } });
  if (!usuarioAtual) return NextResponse.json({ erro: "Usuário atual inválido." }, { status: 400 });

  const responsavelFinal = parsed.data.responsavel ?? card.responsavel;

  try {
    assertCardNaoRevertido({ estadoAtual: card.estado, novoEstado: parsed.data.estado });

    if (parsed.data.estado === "EM_ANDAMENTO") {
      assertPodeMoverCardParaAndamento({ responsavel: responsavelFinal });
    }
    // De "Em andamento" para "Concluído": tanto analistas quanto gestores podem
    // fazer essa mudança — não é mais restrito ao responsável atribuído.

    const atualizado = await db.cardMelhoria.update({
      where: { id: card.id },
      data: {
        estado: parsed.data.estado,
        responsavel: responsavelFinal,
        concluidoEm: parsed.data.estado === "CONCLUIDO" ? new Date() : card.concluidoEm,
      },
    });

    return NextResponse.json(cardParaJson(atualizado));
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
