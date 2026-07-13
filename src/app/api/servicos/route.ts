import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cicloParaJson } from "@/lib/serialize";
import { RegraNegocioError, assertPodeIniciarAnalise } from "@/lib/stateMachine";
import { processarArquivos } from "@/lib/uploads";
import { gerarRelatorioMock } from "@/lib/ai/mockAnalysis";
import type { EstadoServico } from "@/types";

const CICLO_INCLUDE = { documentos: true, relatorio: true, cards: true } as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estados = searchParams.getAll("estado") as EstadoServico[];
  const secretariaIds = searchParams.getAll("secretariaId");

  const servicos = await db.servico.findMany({
    where: {
      ...(estados.length > 0 ? { estado: { in: estados } } : {}),
      ...(secretariaIds.length > 0 ? { secretariaId: { in: secretariaIds } } : {}),
    },
    include: { secretaria: true, ciclos: { orderBy: { versao: "desc" }, take: 1, include: CICLO_INCLUDE } },
    orderBy: { criadoEm: "desc" },
  });

  const resultado = servicos.map((servico) => ({
    id: servico.id,
    nome: servico.nome,
    estado: servico.estado,
    origem: servico.origem,
    versaoAtual: servico.versaoAtual,
    criadoEm: servico.criadoEm,
    secretaria: servico.secretaria,
    cicloAtual: servico.ciclos[0] ? cicloParaJson(servico.ciclos[0]) : null,
  }));

  return NextResponse.json(resultado);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const nome = String(formData.get("nome") ?? "").trim();
  const secretariaId = String(formData.get("secretariaId") ?? "").trim();
  const responsavelAnalise = String(formData.get("responsavelAnalise") ?? "").trim();
  const contextoAdicionalRaw = formData.get("contextoAdicional");
  const contextoAdicional = contextoAdicionalRaw ? String(contextoAdicionalRaw).trim() : null;
  const iniciarAnalise = formData.get("iniciarAnalise") === "true";
  const arquivos = formData.getAll("arquivos").filter((item): item is File => item instanceof File && item.size > 0);

  if (!nome) return NextResponse.json({ erro: "Informe o nome do serviço." }, { status: 400 });
  if (!secretariaId) return NextResponse.json({ erro: "Selecione a secretaria responsável." }, { status: 400 });

  const secretaria = await db.secretaria.findUnique({ where: { id: secretariaId } });
  if (!secretaria) return NextResponse.json({ erro: "Secretaria não encontrada." }, { status: 400 });

  try {
    const servico = await db.servico.create({
      data: { nome, secretariaId, origem: "IMPORTADO", estado: "AGUARDANDO_ANALISE", versaoAtual: 0 },
    });

    const ciclo = await db.ciclo.create({
      data: { servicoId: servico.id, versao: 1, responsavelAnalise, contextoAdicional },
    });

    const documentosProcessados = await processarArquivos(servico.id, arquivos);
    if (documentosProcessados.length > 0) {
      await db.documento.createMany({
        data: documentosProcessados.map((doc) => ({ ...doc, cicloId: ciclo.id })),
      });
    }

    if (iniciarAnalise) {
      assertPodeIniciarAnalise({
        quantidadeDocumentos: documentosProcessados.length,
        nome,
        secretariaId,
        responsavelAnalise,
      });

      const relatorioGerado = await gerarRelatorioMock({
        servicoNome: nome,
        secretariaNome: secretaria.nome,
        documentos: documentosProcessados.map((d) => ({ nome: d.nome })),
        contextoAdicional,
        comentariosOuvidoria: [],
        seed: ciclo.id,
      });
      await db.ciclo.update({ where: { id: ciclo.id }, data: { analiseIniciadaEm: new Date() } });
      await db.relatorio.create({
        data: {
          cicloId: ciclo.id,
          jornada: JSON.stringify(relatorioGerado.jornada),
          pontosFalha: JSON.stringify(relatorioGerado.pontosFalha),
          momentosVerdade: JSON.stringify(relatorioGerado.momentosVerdade),
          matrizPriorizacao: JSON.stringify(relatorioGerado.pontosFalha),
          recomendacoes: JSON.stringify(relatorioGerado.recomendacoes),
        },
      });
      await db.servico.update({ where: { id: servico.id }, data: { estado: "EM_ANALISE" } });
    }

    return NextResponse.json({ id: servico.id, cicloId: ciclo.id }, { status: 201 });
  } catch (error) {
    if (error instanceof RegraNegocioError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    throw error;
  }
}
