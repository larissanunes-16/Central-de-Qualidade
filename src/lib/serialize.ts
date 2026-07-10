import type { CardMelhoria, Ciclo, Documento, Relatorio } from "@prisma/client";
import { calcularPercentualConclusao } from "./stateMachine";

export function relatorioParaJson(relatorio: Relatorio | null) {
  if (!relatorio) return null;
  return {
    id: relatorio.id,
    jornada: JSON.parse(relatorio.jornada),
    pontosFalha: JSON.parse(relatorio.pontosFalha),
    momentosVerdade: JSON.parse(relatorio.momentosVerdade),
    matrizPriorizacao: JSON.parse(relatorio.matrizPriorizacao),
    recomendacoes: JSON.parse(relatorio.recomendacoes),
    layoutSugerido: relatorio.layoutSugerido ? JSON.parse(relatorio.layoutSugerido) : null,
    geradoEm: relatorio.geradoEm,
    editadoManualmente: relatorio.editadoManualmente,
  };
}

export function documentoParaJson(doc: Documento) {
  return {
    id: doc.id,
    nome: doc.nome,
    tipoMime: doc.tipoMime,
    tamanhoBytes: doc.tamanhoBytes,
    criadoEm: doc.criadoEm,
  };
}

export function cardParaJson(card: CardMelhoria) {
  return {
    id: card.id,
    recomendacaoRef: card.recomendacaoRef,
    titulo: card.titulo,
    categoria: card.categoria,
    estado: card.estado,
    responsavel: card.responsavel,
    criadoEm: card.criadoEm,
    concluidoEm: card.concluidoEm,
  };
}

type CicloCompleto = Ciclo & {
  documentos: Documento[];
  relatorio: Relatorio | null;
  cards: CardMelhoria[];
};

export function cicloParaJson(ciclo: CicloCompleto) {
  const totalCards = ciclo.cards.length;
  const cardsConcluidos = ciclo.cards.filter((c) => c.estado === "CONCLUIDO").length;
  return {
    id: ciclo.id,
    versao: ciclo.versao,
    dataInicio: ciclo.dataInicio,
    dataConclusao: ciclo.dataConclusao,
    responsavelAnalise: ciclo.responsavelAnalise,
    contextoAdicional: ciclo.contextoAdicional,
    comparativoAntes: ciclo.comparativoAntes,
    comparativoDepois: ciclo.comparativoDepois,
    membrosParticipantes: ciclo.membrosParticipantes ? JSON.parse(ciclo.membrosParticipantes) : [],
    analiseIniciadaEm: ciclo.analiseIniciadaEm,
    falhaProcessamento: ciclo.falhaProcessamento,
    documentos: ciclo.documentos.map(documentoParaJson),
    relatorio: relatorioParaJson(ciclo.relatorio),
    cards: ciclo.cards.map(cardParaJson),
    totalCards,
    cardsConcluidos,
    percentualConclusao: calcularPercentualConclusao(totalCards, cardsConcluidos),
  };
}
