import { criarGeradorSeed, embaralhar } from "./seededRandom";
import type { LayoutSugerido } from "./types";

// Usado apenas quando o serviço nasce pelo módulo "Criação de novo serviço": o relatório
// de achados, além de indicar melhorias, sugere um layout inicial com boas práticas.
export function gerarLayoutSugeridoMock(servicoNome: string, seed: string): LayoutSugerido {
  const random = criarGeradorSeed(seed + ":layout");

  const catalogoSecoes = [
    { titulo: "Cabeçalho com contexto do serviço", descricao: `Nome do serviço, órgão responsável e tempo médio estimado para concluir "${servicoNome}", visíveis antes de qualquer campo.` },
    { titulo: "Formulário em etapas curtas", descricao: "Dividir o preenchimento em blocos pequenos com indicador de progresso, evitando um formulário único e extenso." },
    { titulo: "Resumo antes da confirmação", descricao: "Tela de revisão com todos os dados preenchidos antes do envio final, permitindo correção sem recomeçar o fluxo." },
    { titulo: "Confirmação com próximos passos", descricao: "Após concluir a solicitação, exibir claramente o que o usuário deve esperar a seguir e por qual canal." },
    { titulo: "Acesso rápido a suporte", descricao: "Canal de ajuda visível em todas as etapas, sem exigir que o usuário abandone o formulário para buscar contato." },
  ];

  const boasPraticasCatalogo = [
    "Usar linguagem simples, sem jargão administrativo.",
    "Garantir contraste e tamanho de fonte adequados para acessibilidade.",
    "Exibir mensagens de erro específicas, indicando o campo e a correção esperada.",
    "Manter o layout responsivo para uso em dispositivos móveis.",
    "Salvar o progresso automaticamente para evitar perda de dados preenchidos.",
  ];

  return {
    secoes: embaralhar(random, catalogoSecoes),
    boasPraticas: embaralhar(random, boasPraticasCatalogo),
  };
}
