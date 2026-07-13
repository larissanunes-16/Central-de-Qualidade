import { criarGeradorSeed, embaralhar, escolher } from "./seededRandom";
import type { EntradaAnalisePreditiva, EtapaJornada, MomentoVerdade, PontoFalha, Recomendacao, RelatorioGerado } from "./types";

// Gera a "Análise de Riscos Previstos" de um serviço que ainda não existe —
// parte da descrição estruturada do formulário guiado (objetivo, público,
// etapas previstas, canais e integrações), não de documentos/evidências.
//
// Reaproveita o mesmo formato de retorno de `gerarRelatorioMock`
// (`RelatorioGerado`), só com conteúdo e semântica de risco previsto em vez
// de falha observada — assim o resto do app (visualização, exportação,
// edição) não precisa de um tipo de dado paralelo.
export async function gerarAnalisePreditivaMock(entrada: EntradaAnalisePreditiva): Promise<RelatorioGerado> {
  const random = criarGeradorSeed(entrada.seed);

  const jornada: EtapaJornada[] = entrada.etapasPrevistas.map((etapa) => {
    const riscoAlto = random() < 0.45;
    const emocao = riscoAlto ? escolher(random, ["Frustrado", "Confuso"] as const) : escolher(random, ["Satisfeito", "Neutro"] as const);
    return {
      etapa,
      emocao,
      falha: riscoAlto,
      descricao: riscoAlto
        ? `Etapa prevista "${etapa}" concentra risco significativo para ${entrada.publicoAlvo} caso o fluxo não seja bem desenhado antes do lançamento de ${entrada.servicoNome}.`
        : `Etapa prevista "${etapa}" tende a ser tranquila para ${entrada.publicoAlvo}, desde que siga o desenho planejado de ${entrada.servicoNome}.`,
    };
  });

  const catalogoRiscosPorCanal: Record<string, Omit<PontoFalha, "id">> = {
    Aplicativo: {
      titulo: "Dependência de app em público pouco familiarizado",
      descricao: `Parte de ${entrada.publicoAlvo} pode ter dificuldade para instalar ou usar um aplicativo para acessar ${entrada.servicoNome}, sem alternativa clara.`,
      categoria: "Tecnológico",
      prioridade: "Alta",
      impacto: "Alta",
      esforco: "Média",
    },
    Site: {
      titulo: "Indisponibilidade do site em picos de acesso",
      descricao: `Se ${entrada.servicoNome} depender de um site sem planejamento de capacidade, picos de acesso podem deixar ${entrada.publicoAlvo} sem conseguir concluir a solicitação.`,
      categoria: "Tecnológico",
      prioridade: "Média",
      impacto: "Alta",
      esforco: "Média",
    },
    Presencial: {
      titulo: "Filas e capacidade de atendimento presencial",
      descricao: `O canal presencial de ${entrada.servicoNome} pode gerar filas se a demanda de ${entrada.publicoAlvo} superar a capacidade planejada das unidades.`,
      categoria: "Operacional",
      prioridade: "Alta",
      impacto: "Alta",
      esforco: "Alta",
    },
    Telefone: {
      titulo: "Tempo de espera no canal telefônico",
      descricao: `Sem dimensionamento adequado da central, o atendimento por telefone de ${entrada.servicoNome} tende a gerar espera longa para ${entrada.publicoAlvo}.`,
      categoria: "Operacional",
      prioridade: "Média",
      impacto: "Média",
      esforco: "Média",
    },
    WhatsApp: {
      titulo: "Falta de retorno humano no atendimento por WhatsApp",
      descricao: `Se o atendimento de ${entrada.servicoNome} via WhatsApp depender só de respostas automáticas, ${entrada.publicoAlvo} pode ficar sem solução para casos fora do padrão.`,
      categoria: "Humano",
      prioridade: "Média",
      impacto: "Média",
      esforco: "Baixa",
    },
  };

  const riscosGenericos: Omit<PontoFalha, "id">[] = [
    {
      titulo: "Falta de linguagem acessível na comunicação inicial",
      descricao: `Se as regras de ${entrada.servicoNome} não forem explicadas em linguagem simples, ${entrada.publicoAlvo} pode desistir antes de entender como participar.`,
      categoria: "Humano",
      prioridade: "Média",
      impacto: "Média",
      esforco: "Baixa",
    },
    {
      titulo: "Equipe sem treinamento para o lançamento",
      descricao: `Servidores envolvidos em ${entrada.servicoNome} podem não estar preparados para orientar ${entrada.publicoAlvo} nas primeiras semanas após o lançamento.`,
      categoria: "Humano",
      prioridade: "Alta",
      impacto: "Alta",
      esforco: "Média",
    },
  ];

  const riscosPorCanal = entrada.canaisPrevistos
    .map((canal) => catalogoRiscosPorCanal[canal])
    .filter((risco): risco is Omit<PontoFalha, "id"> => Boolean(risco));

  const catalogoIntegracao: Omit<PontoFalha, "id">[] = entrada.integracoesPrevistas
    ? [
        {
          titulo: "Integração com sistema externo ainda não validada",
          descricao: `${entrada.servicoNome} depende de integração com "${entrada.integracoesPrevistas}", que precisa ser testada de ponta a ponta antes do lançamento para evitar falhas de dados.`,
          categoria: "Tecnológico",
          prioridade: "Alta",
          impacto: "Alta",
          esforco: "Alta",
        },
      ]
    : [];

  const catalogoCompleto = embaralhar(random, [...riscosPorCanal, ...catalogoIntegracao, ...riscosGenericos]);
  const pontosFalha: PontoFalha[] = catalogoCompleto
    .slice(0, Math.min(5, Math.max(3, catalogoCompleto.length)))
    .map((risco, index) => ({ ...risco, id: `risco-${index + 1}` }));

  const catalogoMomentos: MomentoVerdade[] = [
    {
      titulo: "Primeira tentativa de acesso após o lançamento",
      descricao: `Os primeiros dias de ${entrada.servicoNome} definem a confiança inicial de ${entrada.publicoAlvo} no serviço.`,
      nivelRisco: "Alto",
    },
    {
      titulo: "Primeiro caso fora do padrão previsto",
      descricao: `Como a equipe reage ao primeiro caso que não segue o fluxo planejado de ${entrada.servicoNome} molda a percepção de confiabilidade.`,
      nivelRisco: "Médio",
    },
  ];

  const recomendacoes: Recomendacao[] = pontosFalha.map((risco, index) => ({
    id: `rec-prev-${index + 1}`,
    titulo: `Prevenir: ${risco.titulo.toLowerCase()}`,
    descricao: gerarRecomendacaoPreventivaPara(risco),
    categoria: risco.categoria,
    prioridade: risco.prioridade,
  }));

  return {
    jornada,
    pontosFalha,
    momentosVerdade: catalogoMomentos,
    recomendacoes,
  };
}

function gerarRecomendacaoPreventivaPara(risco: Omit<PontoFalha, "id">): string {
  switch (risco.categoria) {
    case "Tecnológico":
      return `Validar e testar antes do lançamento: ${risco.descricao}`;
    case "Operacional":
      return `Planejar capacidade e contingência para: ${risco.descricao}`;
    case "Humano":
      return `Preparar e treinar a equipe com antecedência para: ${risco.descricao}`;
    default:
      return risco.descricao;
  }
}
