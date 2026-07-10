import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function GET() {
  const usuarios = await db.usuario.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(usuarios);
}

const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  papel: z.enum(["ANALISTA", "GESTOR"]).default("ANALISTA"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = criarUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  try {
    const usuario = await db.usuario.create({ data: parsed.data });
    return NextResponse.json(usuario, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Já existe um usuário com este e-mail." }, { status: 409 });
  }
}
