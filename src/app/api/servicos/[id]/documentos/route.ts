import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegraNegocioError } from "@/lib/stateMachine";
import { processarArquivos } from "@/lib/uploads";
import { documentoParaJson } from "@/lib/serialize";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const servico = await db.servico.findUnique({
    where: { id: params.id },
    include: { ciclos: { orderBy: { versao: "desc" }, take: 1 } },
  });
  if (!servico) return NextResponse.json({ erro: "Serviço não encontrado." }, { status: 404 });
  if (servico.estado !== "AGUARDANDO_ANALISE") {
    return NextResponse.json({ erro: "Documentos só podem ser adicionados enquanto o serviço aguarda análise." }, { status: 400 });
  }
  const ciclo = servico.ciclos[0];

  const formData = await request.formData();
  const arquivos = formData.getAll("arquivos").filter((item): item is File => item instanceof File && item.size > 0);
  if (arquivos.length === 0) {
    return NextResponse.json({ erro: "Selecione ao menos um arquivo." }, { status: 400 });
  }

  try {
    const documentosProcessados = await processarArquivos(servico.id, arquivos);
    const documentos = await db.$transaction(
      documentosProcessados.map((doc) => db.documento.create({ data: { ...doc, cicloId: ciclo.id } })),
    );
    return NextResponse.json(documentos.map(documentoParaJson), { status: 201 });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
