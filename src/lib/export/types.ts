import type { RelatorioGerado } from "../ai/types";

export type DadosExportacaoRelatorio = RelatorioGerado & {
  servicoNome: string;
  secretariaNome: string;
  versaoCiclo: number;
  geradoEm: Date;
};
