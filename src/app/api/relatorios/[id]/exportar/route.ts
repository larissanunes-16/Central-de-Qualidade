import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gerarRelatorioPdf } from "@/lib/export/pdf";
import { gerarRelatorioDocx } from "@/lib/export/docx";
import type { DadosExportacaoRelatorio } from "@/lib/export/types";

// RN-13: relatório exportável em PDF e Word preservando a formatação do template institucional.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const formato = searchParams.get("formato") === "docx" ? "docx" : "pdf";

  const relatorio = await db.relatorio.findUnique({
    where: { id: params.id },
    include: { ciclo: { include: { servico: { include: { secretaria: true } } } } },
  });
  if (!relatorio) return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });

  const tipo = relatorio.ciclo.tipo === "PREDITIVO" ? "PREDITIVO" : "DIAGNOSTICO";

  const dados: DadosExportacaoRelatorio = {
    servicoNome: relatorio.ciclo.servico.nome,
    secretariaNome: relatorio.ciclo.servico.secretaria.nome,
    versaoCiclo: relatorio.ciclo.versao,
    geradoEm: relatorio.geradoEm,
    tipo,
    jornada: JSON.parse(relatorio.jornada),
    pontosFalha: JSON.parse(relatorio.pontosFalha),
    momentosVerdade: JSON.parse(relatorio.momentosVerdade),
    recomendacoes: JSON.parse(relatorio.recomendacoes),
    layoutSugerido: relatorio.layoutSugerido ? JSON.parse(relatorio.layoutSugerido) : undefined,
  };

  const prefixoArquivo = tipo === "PREDITIVO" ? "analise-riscos" : "relatorio-achados";
  const nomeArquivo = `${prefixoArquivo}-${relatorio.ciclo.servico.nome.replace(/[^a-zA-Z0-9]+/g, "-")}-v${relatorio.ciclo.versao}`;

  if (formato === "docx") {
    const buffer = await gerarRelatorioDocx(dados);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${nomeArquivo}.docx"`,
      },
    });
  }

  const buffer = await gerarRelatorioPdf(dados);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}.pdf"`,
    },
  });
}
