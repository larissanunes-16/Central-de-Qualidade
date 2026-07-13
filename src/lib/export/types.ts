import type { RelatorioGerado } from "../ai/types";

export type DadosExportacaoRelatorio = RelatorioGerado & {
  servicoNome: string;
  secretariaNome: string;
  versaoCiclo: number;
  geradoEm: Date;
  tipo?: "PREDITIVO" | "DIAGNOSTICO";
};

export const ROTULOS_EXPORTACAO_POR_TIPO = {
  DIAGNOSTICO: {
    titulo: "Relatório de Achados — Template SECTI",
    jornada: "Jornada do usuário",
    pontosFalha: "Pontos de falha",
    momentosVerdade: "Momentos da verdade",
    recomendacoes: "Recomendações",
    esforco: "Esforço",
  },
  PREDITIVO: {
    titulo: "Análise de Riscos Previstos — Template SECTI",
    jornada: "Jornada prevista",
    pontosFalha: "Riscos previstos",
    momentosVerdade: "Momentos críticos previstos",
    recomendacoes: "Recomendações preventivas",
    esforco: "Esforço de mitigação",
  },
} as const;
