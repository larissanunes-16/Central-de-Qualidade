// Contrato de retorno do "gerador de relatório". Uma futura integração real com a API
// da Anthropic deve implementar a mesma assinatura de `gerarRelatorioMock` e devolver
// exatamente este formato, para que o resto do app não precise ser alterado.

export type EtapaJornada = {
  etapa: string;
  emocao: "Satisfeito" | "Neutro" | "Frustrado" | "Confuso";
  falha: boolean;
  descricao: string;
};

export type PontoFalha = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "Tecnológico" | "Operacional" | "Humano";
  prioridade: "Alta" | "Média" | "Baixa";
  impacto: "Alta" | "Média" | "Baixa";
  esforco: "Alta" | "Média" | "Baixa";
};

export type MomentoVerdade = {
  titulo: string;
  descricao: string;
  nivelRisco: "Alto" | "Médio" | "Baixo";
};

export type Recomendacao = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "Tecnológico" | "Operacional" | "Humano";
  prioridade: "Alta" | "Média" | "Baixa";
};

export type LayoutSugerido = {
  secoes: { titulo: string; descricao: string }[];
  boasPraticas: string[];
};

export type RelatorioGerado = {
  jornada: EtapaJornada[];
  pontosFalha: PontoFalha[];
  momentosVerdade: MomentoVerdade[];
  recomendacoes: Recomendacao[];
  layoutSugerido?: LayoutSugerido;
};

export type EntradaAnalise = {
  servicoNome: string;
  secretariaNome: string;
  documentos: { nome: string }[];
  contextoAdicional?: string | null;
  comentariosOuvidoria: { texto: string }[];
  seed: string;
  incluirLayoutSugerido?: boolean;
};

// Entrada do gerador de análise preditiva: parte da descrição de um serviço
// ainda inexistente (formulário guiado), não de evidências reais.
export type EntradaAnalisePreditiva = {
  servicoNome: string;
  secretariaNome: string;
  objetivoServico: string;
  publicoAlvo: string;
  etapasPrevistas: string[];
  canaisPrevistos: string[];
  integracoesPrevistas?: string | null;
  seed: string;
};
