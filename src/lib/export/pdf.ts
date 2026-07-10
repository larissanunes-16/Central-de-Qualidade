import PDFDocument from "pdfkit";
import type { DadosExportacaoRelatorio } from "./types";

// RN-13: relatório exportável em PDF preservando as seções do template institucional.
export async function gerarRelatorioPdf(dados: DadosExportacaoRelatorio): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const finished = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).font("Helvetica-Bold").text("Relatório de Achados — Template SECTI");
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").text(`Serviço: ${dados.servicoNome}`);
  doc.text(`Secretaria: ${dados.secretariaNome}`);
  doc.text(`Versão do ciclo: v${dados.versaoCiclo}`);
  doc.text(`Data de geração: ${dados.geradoEm.toLocaleDateString("pt-BR")}`);
  doc.moveDown();

  secao(doc, "Jornada do usuário", () => {
    dados.jornada.forEach((etapa) => {
      doc.font("Helvetica-Bold").text(`• ${etapa.etapa} — ${etapa.emocao}${etapa.falha ? " (ponto de falha)" : ""}`);
      doc.font("Helvetica").text(etapa.descricao, { indent: 12 });
      doc.moveDown(0.3);
    });
  });

  secao(doc, "Pontos de falha", () => {
    dados.pontosFalha.forEach((ponto) => {
      doc.font("Helvetica-Bold").text(`• ${ponto.titulo} [${ponto.categoria} · Prioridade ${ponto.prioridade}]`);
      doc.font("Helvetica").text(ponto.descricao, { indent: 12 });
      doc.text(`Impacto: ${ponto.impacto} · Esforço: ${ponto.esforco}`, { indent: 12 });
      doc.moveDown(0.3);
    });
  });

  secao(doc, "Momentos da verdade", () => {
    dados.momentosVerdade.forEach((momento) => {
      doc.font("Helvetica-Bold").text(`• ${momento.titulo} [Risco ${momento.nivelRisco}]`);
      doc.font("Helvetica").text(momento.descricao, { indent: 12 });
      doc.moveDown(0.3);
    });
  });

  secao(doc, "Recomendações", () => {
    dados.recomendacoes.forEach((rec) => {
      doc.font("Helvetica-Bold").text(`• ${rec.titulo} [${rec.categoria} · Prioridade ${rec.prioridade}]`);
      doc.font("Helvetica").text(rec.descricao, { indent: 12 });
      doc.moveDown(0.3);
    });
  });

  if (dados.layoutSugerido) {
    secao(doc, "Layout inicial sugerido", () => {
      dados.layoutSugerido!.secoes.forEach((s) => {
        doc.font("Helvetica-Bold").text(`• ${s.titulo}`);
        doc.font("Helvetica").text(s.descricao, { indent: 12 });
        doc.moveDown(0.3);
      });
      doc.font("Helvetica-Bold").text("Boas práticas:");
      dados.layoutSugerido!.boasPraticas.forEach((b) => doc.font("Helvetica").text(`- ${b}`, { indent: 12 }));
    });
  }

  doc.end();
  return finished;
}

function secao(doc: PDFKit.PDFDocument, titulo: string, conteudo: () => void) {
  doc.moveDown(0.5);
  doc.fontSize(14).font("Helvetica-Bold").text(titulo);
  doc.moveDown(0.3);
  doc.fontSize(10);
  conteudo();
}
