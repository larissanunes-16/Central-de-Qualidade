import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comentarioOuvidoriaSchema } from "@/lib/validation";

// RN-15: comentários da ouvidoria sobre o serviço são insumo adicional para a análise da IA.
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const comentarios = await db.comentarioOuvidoria.findMany({
    where: { servicoId: params.id },
    orderBy: { data: "desc" },
  });
  return NextResponse.json(comentarios);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = comentarioOuvidoriaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const comentario = await db.comentarioOuvidoria.create({
    data: { servicoId: params.id, texto: parsed.data.texto },
  });
  return NextResponse.json(comentario, { status: 201 });
}
