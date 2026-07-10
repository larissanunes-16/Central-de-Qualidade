import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegraNegocioError, assertPodeRemoverDocumento } from "@/lib/stateMachine";

export async function DELETE(_request: Request, { params }: { params: { id: string; docId: string } }) {
  const documento = await db.documento.findUnique({
    where: { id: params.docId },
    include: { ciclo: true },
  });
  if (!documento || documento.ciclo.servicoId !== params.id) {
    return NextResponse.json({ erro: "Documento não encontrado." }, { status: 404 });
  }

  try {
    assertPodeRemoverDocumento({ analiseIniciadaEm: documento.ciclo.analiseIniciadaEm });
  } catch (error) {
    if (error instanceof RegraNegocioError) return NextResponse.json({ erro: error.message }, { status: 400 });
    throw error;
  }

  await db.documento.delete({ where: { id: params.docId } });
  return NextResponse.json({ ok: true });
}
