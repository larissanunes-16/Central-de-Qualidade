import { criarGeradorSeed, embaralhar, escolher } from "./seededRandom";
import type { EntradaAnalise, EtapaJornada, MomentoVerdade, PontoFalha, Recomendacao, RelatorioGerado } from "./types";

// RN-09/RN-10: gera o Relatório de Achados seguindo o template metodológico da SECTI
// (jornada com emoções, pontos de falha categorizados, momentos da verdade com risco,
// matriz de priorização impacto x esforço e recomendações). RN-15: usa também os
// comentários da ouvidoria e o contexto adicional como insumo, além dos documentos.
//
// Esta função é a única peça "de IA" do sistema. Uma integração real (ex.: API da
// Anthropic) deve substituir o corpo desta função — enviando os documentos e os
// comentários da ouvidoria como conteúdo da mensagem — mantendo a mesma assinatura e
// o mesmo formato de retorno (`RelatorioGerado`) para não exigir mudanças no resto do app.
export async function gerarRelatorioMock(entrada: EntradaAnalise): Promise<RelatorioGerado> {
  const random = criarGeradorSeed(entrada.seed);

  const etapasBase = [
    "Descoberta do serviço",
    "Acesso ao canal de atendimento",
    "Preenchimento de informações",
    "Confirmação e agendamento",
    "Acompanhamento e retorno",
  ];
  const jornada: EtapaJornada[] = etapasBase.map((etapa) => {
    const falha = random() < 0.45;
    const emocao = falha ? escolher(random, ["Frustrado", "Confuso"] as const) : escolher(random, ["Satisfeito", "Neutro"] as const);
    return {
      etapa,
      emocao,
      falha,
      descricao: falha
        ? `Usuários relatam dificuldade na etapa "${etapa}" ao utilizar ${entrada.servicoNome}, com abandono ou necessidade de suporte externo.`
        : `Etapa "${etapa}" transcorre sem atritos relevantes para a maioria dos usuários de ${entrada.servicoNome}.`,
    };
  });

  const catalogoPontosFalha: Omit<PontoFalha, "id">[] = [
    {
      titulo: "Ausência de feedback visual durante o carregamento",
      descricao: `O sistema de ${entrada.servicoNome} não indica ao usuário que uma solicitação está sendo processada, gerando cliques repetidos e submissões duplicadas.`,
      categoria: "Tecnológico",
      prioridade: "Alta",
      impacto: "Alta",
      esforco: "Baixa",
    },
    {
      titulo: "Linguagem técnica em formulários",
      descricao: `Campos do formulário de ${entrada.servicoNome} usam termos administrativos pouco compreensíveis para o cidadão comum.`,
      categoria: "Humano",
      prioridade: "Média",
      impacto: "Média",
      esforco: "Baixa",
    },
    {
      titulo: "Fluxo de atendimento presencial sem contingência digital",
      descricao: `Quando o canal digital de ${entrada.servicoNome} apresenta instabilidade, não há alternativa clara para o usuário concluir a solicitação.`,
      categoria: "Operacional",
      prioridade: "Alta",
      impacto: "Alta",
      esforco: "Alta",
    },
    {
      titulo: "Ausência de confirmação por múltiplos canais",
      descricao: `A confirmação da solicitação em ${entrada.servicoNome} é enviada apenas por um canal, e usuários relatam não terem recebido retorno.`,
      categoria: "Tecnológico",
      prioridade: "Média",
      impacto: "Média",
      esforco: "Média",
    },
    {
      titulo: "Falta de treinamento da equipe de atendimento",
      descricao: `Servidores que atuam no atendimento de ${entrada.servicoNome} nem sempre sabem orientar o cidadão sobre etapas seguintes.`,
      categoria: "Humano",
      prioridade: "Média",
      impacto: "Alta",
      esforco: "Média",
    },
    {
      titulo: "Retrabalho por dados não integrados entre sistemas",
      descricao: `Informações preenchidas em ${entrada.servicoNome} não são reaproveitadas de cadastros anteriores, obrigando o usuário a repetir dados.`,
      categoria: "Operacional",
      prioridade: "Baixa",
      impacto: "Média",
      esforco: "Alta",
    },
  ];

  const quantidadePontosFalha = 3 + Math.floor(random() * 3); // 3 a 5 pontos
  const pontosFalha: PontoFalha[] = embaralhar(random, catalogoPontosFalha)
    .slice(0, quantidadePontosFalha)
    .map((ponto, index) => ({ ...ponto, id: `pf-${index + 1}` }));

  const catalogoMomentosVerdade: MomentoVerdade[] = [
    {
      titulo: "Primeiro contato com o canal de atendimento",
      descricao: `A primeira impressão do usuário ao buscar ${entrada.servicoNome} define se ele confia ou não no restante do processo.`,
      nivelRisco: "Alto",
    },
    {
      titulo: "Recebimento da confirmação",
      descricao: `Saber que a solicitação em ${entrada.servicoNome} foi registrada com sucesso é decisivo para a percepção de confiabilidade.`,
      nivelRisco: "Médio",
    },
    {
      titulo: "Resolução de um imprevisto",
      descricao: `Quando algo dá errado durante ${entrada.servicoNome}, a forma como o usuário é atendido determina sua avaliação geral do serviço.`,
      nivelRisco: "Alto",
    },
  ];
  const momentosVerdade = embaralhar(random, catalogoMomentosVerdade).slice(0, 2 + Math.floor(random() * 2));

  const recomendacoes: Recomendacao[] = pontosFalha.map((ponto, index) => ({
    id: `rec-${index + 1}`,
    titulo: `Corrigir: ${ponto.titulo.toLowerCase()}`,
    descricao: gerarRecomendacaoPara(ponto),
    categoria: ponto.categoria,
    prioridade: ponto.prioridade,
  }));

  return {
    jornada,
    pontosFalha,
    momentosVerdade,
    recomendacoes,
  };
}

function gerarRecomendacaoPara(ponto: Omit<PontoFalha, "id">): string {
  switch (ponto.categoria) {
    case "Tecnológico":
      return `Implementar melhoria técnica no fluxo digital: ${ponto.descricao}`;
    case "Operacional":
      return `Ajustar o processo operacional para mitigar: ${ponto.descricao}`;
    case "Humano":
      return `Capacitar a equipe e revisar a comunicação para resolver: ${ponto.descricao}`;
    default:
      return ponto.descricao;
  }
}
