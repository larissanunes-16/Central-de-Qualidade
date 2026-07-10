import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { relatorioParaJson } from "@/lib/serialize";

// RN-14: o analista pode editar manualmente seções do relatório antes de aceitar.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const relatorio = await db.relatorio.findUnique({ where: { id: params.id } });
  if (!relatorio) return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });

  const body = await request.json();
  const camposEditaveis = ["jornada", "pontosFalha", "momentosVerdade", "recomendacoes"] as const;
  const data: Record<string, string> = {};
  for (const campo of camposEditaveis) {
    if (body[campo] !== undefined) data[campo] = JSON.stringify(body[campo]);
  }

  const atualizado = await db.relatorio.update({
    where: { id: params.id },
    data: { ...data, editadoManualmente: true },
  });

  return NextResponse.json(relatorioParaJson(atualizado));
}
