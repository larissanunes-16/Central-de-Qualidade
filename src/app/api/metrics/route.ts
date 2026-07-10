import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [total, emAnalise, emMelhoria, concluidos] = await Promise.all([
    db.servico.count(),
    db.servico.count({ where: { estado: "EM_ANALISE" } }),
    db.servico.count({ where: { estado: "EM_MELHORIA" } }),
    db.servico.count({ where: { estado: "CONCLUIDO" } }),
  ]);
  return NextResponse.json({ total, emAnalise, emMelhoria, concluidos });
}
