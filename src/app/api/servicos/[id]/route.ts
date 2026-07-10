import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cicloParaJson } from "@/lib/serialize";

const CICLO_INCLUDE = { documentos: true, relatorio: true, cards: true } as const;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const servico = await db.servico.findUnique({
    where: { id: params.id },
    include: {
      secretaria: true,
      ciclos: { orderBy: { versao: "desc" }, include: CICLO_INCLUDE },
      comentarios: { orderBy: { data: "desc" } },
    },
  });
  if (!servico) return NextResponse.json({ erro: "Serviço não encontrado." }, { status: 404 });

  const [cicloAtual, ...ciclosAnteriores] = servico.ciclos;

  return NextResponse.json({
    id: servico.id,
    nome: servico.nome,
    estado: servico.estado,
    origem: servico.origem,
    versaoAtual: servico.versaoAtual,
    criadoEm: servico.criadoEm,
    secretaria: servico.secretaria,
    cicloAtual: cicloAtual ? cicloParaJson(cicloAtual) : null,
    ciclosAnteriores: ciclosAnteriores.map(cicloParaJson),
    comentariosOuvidoria: servico.comentarios,
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const servico = await db.servico.findUnique({
    where: { id: params.id },
    include: { ciclos: { orderBy: { versao: "desc" }, take: 1 } },
  });
  if (!servico) return NextResponse.json({ erro: "Serviço não encontrado." }, { status: 404 });
  if (servico.estado !== "AGUARDANDO_ANALISE") {
    return NextResponse.json({ erro: "Só é possível editar o serviço enquanto ele está aguardando análise." }, { status: 400 });
  }

  const body = await request.json();
  const cicloAtual = servico.ciclos[0];

  await db.$transaction([
    db.servico.update({
      where: { id: servico.id },
      data: {
        ...(typeof body.nome === "string" ? { nome: body.nome.trim() } : {}),
        ...(typeof body.secretariaId === "string" ? { secretariaId: body.secretariaId } : {}),
      },
    }),
    ...(cicloAtual
      ? [
          db.ciclo.update({
            where: { id: cicloAtual.id },
            data: {
              ...(typeof body.responsavelAnalise === "string" ? { responsavelAnalise: body.responsavelAnalise.trim() } : {}),
              ...(typeof body.contextoAdicional === "string" ? { contextoAdicional: body.contextoAdicional.trim() } : {}),
            },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
