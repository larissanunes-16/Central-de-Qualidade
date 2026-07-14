// Dados de exemplo para o layout do Dashboard da Ouvidoria 4.0. Sem integração
// real ainda — os números aqui são ilustrativos, só para validar a tela antes
// da base de dados real chegar.

export const CORES_SENTIMENTO = {
  negativo: "#e34948",
  neutro: "#94a3b8",
  positivo: "#0ca30c",
} as const;

export const COR_MAGNITUDE = "#eda100"; // amber — hue único para os gráficos de magnitude (Natureza)
export const COR_SIGILOSA_SIM = "#2a78d6"; // brand blue
export const COR_SIGILOSA_NAO = "#cbd5e1"; // slate-300, recessivo
export const COR_RECEBIDAS = "#2a78d6";
export const COR_RESPONDIDAS = "#4a3aa7";

export const MESES_ABREVIADOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

export const DADOS_POR_MES = MESES_ABREVIADOS.map((mes, index) => ({
  mes,
  recebidas: 3200 + index * 180 + (index % 2 === 0 ? 220 : 0),
  respondidas: 2600 + index * 210 + (index % 2 === 0 ? 150 : 0),
}));

export const KPIS_OUVIDORIA = {
  manifestacoes: 23728,
  respondidas: 19386,
  foraDoPrazo: 4342,
  negativas: 16260,
  neutras: 7030,
  positivas: 419,
};

export const NATUREZA_MANIFESTACAO = [
  { natureza: "Reclamação", total: 9840 },
  { natureza: "Solicitação", total: 6120 },
  { natureza: "Informação", total: 3450 },
  { natureza: "Denúncia", total: 2380 },
  { natureza: "Sugestão", total: 1120 },
  { natureza: "Elogio", total: 818 },
];

export const SENTIMENTO_MANIFESTACAO = [
  { nome: "Negativo", valor: 68, cor: CORES_SENTIMENTO.negativo },
  { nome: "Neutro", valor: 29, cor: CORES_SENTIMENTO.neutro },
  { nome: "Positivo", valor: 3, cor: CORES_SENTIMENTO.positivo },
];

export const MANIFESTACAO_SIGILOSA = [
  { nome: "Não", valor: 88, cor: COR_SIGILOSA_NAO },
  { nome: "Sim", valor: 12, cor: COR_SIGILOSA_SIM },
];

export type LinhaTabelaOuvidoria = {
  rotulo: string;
  negativo: number;
  neutro: number;
  positivo: number;
};

function comPercentualETotal(linhas: LinhaTabelaOuvidoria[]) {
  return linhas.map((linha) => {
    const total = linha.negativo + linha.neutro + linha.positivo;
    return { ...linha, total, percentualNegativo: total === 0 ? 0 : Math.round((linha.negativo / total) * 100) };
  });
}

export const ABAS_TABELA_OUVIDORIA = ["Órgão", "Serviço", "Categoria", "Grupo", "Público-alvo"] as const;
export type AbaTabelaOuvidoria = (typeof ABAS_TABELA_OUVIDORIA)[number];

export const DADOS_TABELA_OUVIDORIA: Record<AbaTabelaOuvidoria, ReturnType<typeof comPercentualETotal>> = {
  Órgão: comPercentualETotal([
    { rotulo: "Autarquia de Trânsito e Transporte Urbano do Recife", negativo: 539, neutro: 79, positivo: 4 },
    { rotulo: "Controladoria-Geral do Município", negativo: 336, neutro: 76, positivo: 10 },
    { rotulo: "Fundação de Cultura Cidade do Recife", negativo: 6, neutro: 2, positivo: 0 },
    { rotulo: "Gabinete de Proteção e Defesa dos Animais", negativo: 2, neutro: 0, positivo: 0 },
    { rotulo: "Procuradoria-Geral do Município", negativo: 1, neutro: 0, positivo: 0 },
    { rotulo: "Secretaria de Assistência Social e Cidadania", negativo: 52, neutro: 8, positivo: 1 },
    { rotulo: "Secretaria de Desenvolvimento Urbano e Licenciamento", negativo: 34, neutro: 6, positivo: 0 },
    { rotulo: "Secretaria de Educação", negativo: 779, neutro: 58, positivo: 7 },
    { rotulo: "Secretaria de Esportes", negativo: 45, neutro: 3, positivo: 4 },
  ]),
  Serviço: comPercentualETotal([
    { rotulo: "Agendamento de Consultas", negativo: 412, neutro: 61, positivo: 12 },
    { rotulo: "Emissão de Alvará", negativo: 288, neutro: 40, positivo: 5 },
    { rotulo: "Matrícula Escolar", negativo: 195, neutro: 33, positivo: 9 },
    { rotulo: "Poda de Árvores", negativo: 121, neutro: 18, positivo: 2 },
  ]),
  Categoria: comPercentualETotal([
    { rotulo: "Atendimento presencial", negativo: 501, neutro: 88, positivo: 14 },
    { rotulo: "Canal digital (app/site)", negativo: 344, neutro: 52, positivo: 8 },
    { rotulo: "Prazo de resposta", negativo: 298, neutro: 21, positivo: 1 },
  ]),
  Grupo: comPercentualETotal([
    { rotulo: "Grupo Saúde", negativo: 610, neutro: 74, positivo: 6 },
    { rotulo: "Grupo Educação", negativo: 512, neutro: 60, positivo: 9 },
    { rotulo: "Grupo Mobilidade Urbana", negativo: 388, neutro: 45, positivo: 3 },
  ]),
  "Público-alvo": comPercentualETotal([
    { rotulo: "Pessoa física", negativo: 1240, neutro: 210, positivo: 32 },
    { rotulo: "Pessoa jurídica", negativo: 318, neutro: 54, positivo: 6 },
    { rotulo: "Servidor público", negativo: 96, neutro: 14, positivo: 2 },
  ]),
};

export type ManifestacaoRecente = {
  dataEntrada: string;
  protocolo: string;
  resumo: string;
};

export const MANIFESTACOES_RECENTES: ManifestacaoRecente[] = [
  { dataEntrada: "13/01/2026", protocolo: "OUV-2026-004821", resumo: "Solicitação de informações sobre o andamento de um pedido protocolado no mês anterior." },
  { dataEntrada: "13/01/2026", protocolo: "OUV-2026-004818", resumo: "Reclamação sobre demora no retorno de um canal de atendimento presencial." },
  { dataEntrada: "12/01/2026", protocolo: "OUV-2026-004795", resumo: "Elogio ao atendimento recebido em uma unidade de referência da secretaria." },
  { dataEntrada: "12/01/2026", protocolo: "OUV-2026-004781", resumo: "Sugestão de melhoria no aplicativo usado para acompanhar solicitações." },
  { dataEntrada: "11/01/2026", protocolo: "OUV-2026-004760", resumo: "Denúncia sobre irregularidade percebida na prestação de um serviço público." },
];
