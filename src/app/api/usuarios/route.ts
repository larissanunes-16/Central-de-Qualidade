import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { RegraNegocioError, assertUsuarioEhGestor } from "@/lib/stateMachine";

export async function GET() {
  const usuarios = await db.usuario.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(usuarios);
}

const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  papel: z.enum(["ANALISTA", "GESTOR"]).default("ANALISTA"),
  usuarioAtualId: z.string().min(1, "Selecione o usuário atual."),
});

// Apenas um gestor pode adicionar membros à equipe.
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = criarUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const usuarioAtual = await db.usuario.findUnique({ where: { id: parsed.data.usuarioAtualId } });

  try {
    assertUsuarioEhGestor({ papel: usuarioAtual?.papel, mensagem: "Apenas um gestor pode adicionar membros à equipe." });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }

  try {
    const usuario = await db.usuario.create({
      data: { nome: parsed.data.nome, email: parsed.data.email, papel: parsed.data.papel },
    });
    return NextResponse.json(usuario, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Já existe um usuário com este e-mail." }, { status: 409 });
  }
}
