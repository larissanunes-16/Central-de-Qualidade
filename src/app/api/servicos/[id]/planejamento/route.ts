import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Edita as respostas do formulário guiado enquanto o serviço ainda está em
// PLANEJAMENTO (rascunho, análise preditiva ainda não gerada).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const servico = await db.servico.findUnique({
    where: { id: params.id },
    include: { ciclos: { orderBy: { versao: "desc" }, take: 1 } },
  });
  if (!servico) return NextResponse.json({ erro: "Serviço não encontrado." }, { status: 404 });
  if (servico.estado !== "PLANEJAMENTO") {
    return NextResponse.json({ erro: "Só é possível editar o formulário enquanto o serviço está em planejamento." }, { status: 400 });
  }
  const ciclo = servico.ciclos[0];
  if (!ciclo) return NextResponse.json({ erro: "Nenhum ciclo de planejamento encontrado." }, { status: 400 });

  const body = await request.json();

  await db.$transaction([
    db.servico.update({
      where: { id: servico.id },
      data: {
        ...(typeof body.nome === "string" ? { nome: body.nome.trim() } : {}),
        ...(typeof body.secretariaId === "string" ? { secretariaId: body.secretariaId } : {}),
      },
    }),
    db.ciclo.update({
      where: { id: ciclo.id },
      data: {
        ...(typeof body.responsavelAnalise === "string" ? { responsavelAnalise: body.responsavelAnalise.trim() } : {}),
        ...(typeof body.objetivoServico === "string" ? { objetivoServico: body.objetivoServico.trim() } : {}),
        ...(typeof body.publicoAlvo === "string" ? { publicoAlvo: body.publicoAlvo.trim() } : {}),
        ...(Array.isArray(body.etapasPrevistas) ? { etapasPrevistas: JSON.stringify(body.etapasPrevistas) } : {}),
        ...(Array.isArray(body.canaisPrevistos) ? { canaisPrevistos: JSON.stringify(body.canaisPrevistos) } : {}),
        ...(typeof body.integracoesPrevistas === "string" ? { integracoesPrevistas: body.integracoesPrevistas.trim() } : {}),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
