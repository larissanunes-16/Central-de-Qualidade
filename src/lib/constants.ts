export const SECRETARIAS_PADRAO = [
  "SECTI — Secretaria de Transformação Digital, Ciência e Tecnologia",
  "Secretaria de Saúde",
  "Secretaria de Fazenda",
  "Secretaria de Educação",
];

export const FORMATOS_ACEITOS = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export const EXTENSOES_ACEITAS = [".pdf", ".docx", ".jpeg", ".jpg", ".png"];

export const TAMANHO_MAXIMO_BYTES = 20 * 1024 * 1024; // RN-02: 20 MB

export const ESTADOS_SERVICO = [
  "AGUARDANDO_ANALISE",
  "EM_ANALISE",
  "EM_MELHORIA",
  "CONCLUIDO",
] as const;

export const ROTULOS_ESTADO_SERVICO: Record<string, string> = {
  AGUARDANDO_ANALISE: "Aguardando análise",
  EM_ANALISE: "Em análise",
  EM_MELHORIA: "Em melhoria",
  CONCLUIDO: "Concluído",
};

export const ROTULOS_ESTADO_CARD: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export const DURACAO_SIMULACAO_ANALISE_MS = 6000; // RN-11: indicador de progresso da IA

export const CATEGORIAS_PONTO_FALHA = ["Tecnológico", "Operacional", "Humano"] as const;
export const PRIORIDADES = ["Alta", "Média", "Baixa"] as const;
export const NIVEIS_RISCO = ["Alto", "Médio", "Baixo"] as const;
export const EMOCOES_JORNADA = ["Satisfeito", "Neutro", "Frustrado", "Confuso"] as const;
