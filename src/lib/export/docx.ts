import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { ROTULOS_EXPORTACAO_POR_TIPO, type DadosExportacaoRelatorio } from "./types";

// RN-13: relatório exportável em Word (DOCX) preservando as seções do template institucional.
export async function gerarRelatorioDocx(dados: DadosExportacaoRelatorio): Promise<Buffer> {
  const rotulos = ROTULOS_EXPORTACAO_POR_TIPO[dados.tipo ?? "DIAGNOSTICO"];
  const paragrafos: Paragraph[] = [];

  paragrafos.push(
    new Paragraph({ text: rotulos.titulo, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: `Serviço: ${dados.servicoNome}` }),
    new Paragraph({ text: `Secretaria: ${dados.secretariaNome}` }),
    new Paragraph({ text: `Versão do ciclo: v${dados.versaoCiclo}` }),
    new Paragraph({ text: `Data de geração: ${dados.geradoEm.toLocaleDateString("pt-BR")}` }),
  );

  paragrafos.push(new Paragraph({ text: rotulos.jornada, heading: HeadingLevel.HEADING_1 }));
  dados.jornada.forEach((etapa) => {
    paragrafos.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${etapa.etapa} — ${etapa.emocao}${etapa.falha ? " (risco)" : ""}`, bold: true }),
        ],
      }),
      new Paragraph({ text: etapa.descricao }),
    );
  });

  paragrafos.push(new Paragraph({ text: rotulos.pontosFalha, heading: HeadingLevel.HEADING_1 }));
  dados.pontosFalha.forEach((ponto) => {
    paragrafos.push(
      new Paragraph({
        children: [new TextRun({ text: `${ponto.titulo} [${ponto.categoria} · Prioridade ${ponto.prioridade}]`, bold: true })],
      }),
      new Paragraph({ text: ponto.descricao }),
      new Paragraph({ text: `Impacto: ${ponto.impacto} · ${rotulos.esforco}: ${ponto.esforco}` }),
    );
  });

  paragrafos.push(new Paragraph({ text: rotulos.momentosVerdade, heading: HeadingLevel.HEADING_1 }));
  dados.momentosVerdade.forEach((momento) => {
    paragrafos.push(
      new Paragraph({ children: [new TextRun({ text: `${momento.titulo} [Risco ${momento.nivelRisco}]`, bold: true })] }),
      new Paragraph({ text: momento.descricao }),
    );
  });

  paragrafos.push(new Paragraph({ text: rotulos.recomendacoes, heading: HeadingLevel.HEADING_1 }));
  dados.recomendacoes.forEach((rec) => {
    paragrafos.push(
      new Paragraph({
        children: [new TextRun({ text: `${rec.titulo} [${rec.categoria} · Prioridade ${rec.prioridade}]`, bold: true })],
      }),
      new Paragraph({ text: rec.descricao }),
    );
  });

  if (dados.layoutSugerido) {
    paragrafos.push(new Paragraph({ text: "Layout inicial sugerido", heading: HeadingLevel.HEADING_1 }));
    dados.layoutSugerido.secoes.forEach((s) => {
      paragrafos.push(
        new Paragraph({ children: [new TextRun({ text: s.titulo, bold: true })] }),
        new Paragraph({ text: s.descricao }),
      );
    });
    paragrafos.push(new Paragraph({ children: [new TextRun({ text: "Boas práticas:", bold: true })] }));
    dados.layoutSugerido.boasPraticas.forEach((b) => paragrafos.push(new Paragraph({ text: `- ${b}` })));
  }

  const documento = new Document({ sections: [{ children: paragrafos }] });
  return Packer.toBuffer(documento);
}
