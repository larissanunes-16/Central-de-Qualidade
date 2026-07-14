// Centraliza as pré-condições de transição de estado descritas nas seções 3.1 e 6 do
// documento de regras de negócio. Toda rota de API que muda o estado de um Serviço,
// Ciclo ou CardMelhoria deve passar pelas validações daqui antes de gravar no banco.

export class RegraNegocioError extends Error {}

export function assertPodeIniciarAnalise(params: {
  quantidadeDocumentos: number;
  nome?: string | null;
  secretariaId?: string | null;
  responsavelAnalise?: string | null;
}) {
  if (!params.nome) throw new RegraNegocioError("Informe o nome do serviço.");
  if (!params.secretariaId) throw new RegraNegocioError("Selecione a secretaria responsável.");
  if (!params.responsavelAnalise) throw new RegraNegocioError("Informe o responsável pela análise.");
  if (params.quantidadeDocumentos < 1) {
    throw new RegraNegocioError("É necessário importar ao menos 1 documento antes de iniciar a análise.");
  }
}

export function assertPodeRemoverDocumento(params: { analiseIniciadaEm: Date | null }) {
  // RN-06: documentos não podem ser removidos após o início da análise.
  if (params.analiseIniciadaEm) {
    throw new RegraNegocioError("Documentos não podem ser removidos após o início da análise.");
  }
}

export function assertPodeIrParaMaterializacao(params: { relatorioExiste: boolean }) {
  if (!params.relatorioExiste) {
    throw new RegraNegocioError("O relatório de achados precisa ser gerado antes de avançar para a materialização.");
  }
}

export function assertPodeMoverCardParaAndamento(params: { responsavel: string | null | undefined }) {
  // RN-17: todo card deve ter responsável atribuído para ser movido para Em andamento.
  if (!params.responsavel) {
    throw new RegraNegocioError("Atribua um responsável ao card antes de movê-lo para Em andamento.");
  }
}

export function assertCardNaoRevertido(params: { estadoAtual: string; novoEstado: string }) {
  // Estado final: Concluído não pode ser revertido no MVP.
  if (params.estadoAtual === "CONCLUIDO" && params.novoEstado !== "CONCLUIDO") {
    throw new RegraNegocioError("Um card concluído não pode ser revertido.");
  }
}

export function assertPodeConcluirCiclo(params: { totalCards: number; cardsConcluidos: number }) {
  // RN-21: o ciclo só pode ser concluído quando 100% dos cards estiverem concluídos.
  if (params.totalCards === 0 || params.cardsConcluidos < params.totalCards) {
    throw new RegraNegocioError("Todos os cards de melhoria precisam estar concluídos para encerrar o ciclo.");
  }
}

export function assertUsuarioEhGestor(params: { papel: string | null | undefined }) {
  // Apenas um gestor pode concluir o ciclo (arquivar e gerar o comparativo antes/depois).
  if (params.papel !== "GESTOR") {
    throw new RegraNegocioError("Apenas um gestor pode concluir o ciclo.");
  }
}

export function assertPodeGerarAnalisePreditiva(params: {
  nome?: string | null;
  secretariaId?: string | null;
  responsavelAnalise?: string | null;
  objetivoServico?: string | null;
  publicoAlvo?: string | null;
  quantidadeEtapasPrevistas: number;
}) {
  if (!params.nome) throw new RegraNegocioError("Informe o nome do serviço.");
  if (!params.secretariaId) throw new RegraNegocioError("Selecione a secretaria responsável.");
  if (!params.responsavelAnalise) throw new RegraNegocioError("Informe o responsável pela análise.");
  if (!params.objetivoServico) throw new RegraNegocioError("Descreva o objetivo do serviço.");
  if (!params.publicoAlvo) throw new RegraNegocioError("Descreva o público-alvo do serviço.");
  if (params.quantidadeEtapasPrevistas < 1) {
    throw new RegraNegocioError("Informe ao menos 1 etapa prevista da jornada.");
  }
}

export function assertPodeLancarServico(params: { relatorioExiste: boolean }) {
  if (!params.relatorioExiste) {
    throw new RegraNegocioError("A análise preditiva precisa ser gerada antes de lançar o serviço.");
  }
}

export function calcularPercentualConclusao(totalCards: number, cardsConcluidos: number) {
  if (totalCards === 0) return 0;
  return Math.round((cardsConcluidos / totalCards) * 100);
}
