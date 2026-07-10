import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cicloParaJson } from "@/lib/serialize";

// Seção 3.5 / 5.5: histórico de ciclos concluídos, ordenado do mais recente ao mais antigo.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretariaId = searchParams.get("secretariaId");
  const servicoId = searchParams.get("servicoId");

  const ciclos = await db.ciclo.findMany({
    where: {
      dataConclusao: { not: null },
      ...(servicoId ? { servicoId } : {}),
      ...(secretariaId ? { servico: { secretariaId } } : {}),
    },
    include: {
      documentos: true,
      relatorio: true,
      cards: true,
      servico: { include: { secretaria: true } },
    },
    orderBy: { dataConclusao: "desc" },
  });

  const resultado = ciclos.map((ciclo) => ({
    ...cicloParaJson(ciclo),
    servico: {
      id: ciclo.servico.id,
      nome: ciclo.servico.nome,
      secretaria: ciclo.servico.secretaria,
    },
  }));

  return NextResponse.json(resultado);
}
