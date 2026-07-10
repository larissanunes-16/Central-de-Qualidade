import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const secretarias = await db.secretaria.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(secretarias);
}
