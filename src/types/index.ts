export type Secretaria = { id: string; nome: string };

export type Usuario = { id: string; nome: string; email: string; papel: "ANALISTA" | "GESTOR" };

export type EstadoServico = "AGUARDANDO_ANALISE" | "EM_ANALISE" | "EM_MELHORIA" | "CONCLUIDO";
export type EstadoCard = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
export type OrigemServico = "IMPORTADO" | "CRIADO_NOVO";

export type Documento = { id: string; nome: string; tipoMime: string; tamanhoBytes: number; criadoEm: string };

export type EtapaJornada = { etapa: string; emocao: string; falha: boolean; descricao: string };
export type PontoFalha = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: "Alta" | "Média" | "Baixa";
  impacto: "Alta" | "Média" | "Baixa";
  esforco: "Alta" | "Média" | "Baixa";
};
export type MomentoVerdade = { titulo: string; descricao: string; nivelRisco: string };
export type Recomendacao = { id: string; titulo: string; descricao: string; categoria: string; prioridade: string };
export type LayoutSugerido = { secoes: { titulo: string; descricao: string }[]; boasPraticas: string[] };

export type Relatorio = {
  id: string;
  jornada: EtapaJornada[];
  pontosFalha: PontoFalha[];
  momentosVerdade: MomentoVerdade[];
  recomendacoes: Recomendacao[];
  layoutSugerido: LayoutSugerido | null;
  geradoEm: string;
  editadoManualmente: boolean;
};

export type CardMelhoria = {
  id: string;
  recomendacaoRef: string;
  titulo: string;
  categoria: string;
  estado: EstadoCard;
  responsavel: string | null;
  criadoEm: string;
  concluidoEm: string | null;
};

export type Ciclo = {
  id: string;
  versao: number;
  dataInicio: string;
  dataConclusao: string | null;
  responsavelAnalise: string;
  contextoAdicional: string | null;
  comparativoAntes: string | null;
  comparativoDepois: string | null;
  membrosParticipantes: string[];
  analiseIniciadaEm: string | null;
  falhaProcessamento: boolean;
  documentos: Documento[];
  relatorio: Relatorio | null;
  cards: CardMelhoria[];
  totalCards: number;
  cardsConcluidos: number;
  percentualConclusao: number;
};

export type Servico = {
  id: string;
  nome: string;
  estado: EstadoServico;
  origem: OrigemServico;
  versaoAtual: number;
  criadoEm: string;
  secretaria: Secretaria;
  cicloAtual: Ciclo | null;
};

export type ServicoDetalhado = Servico & {
  ciclosAnteriores: Ciclo[];
  comentariosOuvidoria: { id: string; texto: string; data: string }[];
};
