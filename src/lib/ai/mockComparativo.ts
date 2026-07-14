import type { PontoFalha } from "./types";

// Gera o comparativo antes/depois (RN-25) a partir dos dados reais do ciclo:
// "antes" resume os pontos de falha do relatório aceito, "depois" resume as
// melhorias efetivamente concluídas no painel de materialização. Diferente
// dos outros geradores mock, aqui não há conteúdo inventado — é um resumo
// determinístico do que já está registrado no ciclo, então não depende de
// seed aleatória.
export type EntradaComparativo = {
  servicoNome: string;
  pontosFalha: PontoFalha[];
  cardsConcluidos: { titulo: string; categoria: string }[];
};

export function gerarComparativoMock(entrada: EntradaComparativo): { comparativoAntes: string; comparativoDepois: string } {
  const { servicoNome, pontosFalha, cardsConcluidos } = entrada;

  const quantidadeAlta = pontosFalha.filter((p) => p.prioridade === "Alta").length;
  const listaProblemas = pontosFalha.map((p) => p.titulo.toLowerCase());
  const comparativoAntes =
    listaProblemas.length > 0
      ? `Antes da melhoria, a análise de ${servicoNome} identificou ${pontosFalha.length} ponto(s) de falha: ${formatarLista(listaProblemas)}.${
          quantidadeAlta > 0 ? ` ${quantidadeAlta} deles de prioridade alta, impactando diretamente a experiência do usuário.` : ""
        }`
      : `Antes da melhoria, ${servicoNome} não apresentava pontos de falha registrados no relatório de achados.`;

  const listaMelhorias = cardsConcluidos.map((c) => c.titulo.replace(/^(corrigir|prevenir):\s*/i, "").toLowerCase());
  const categoriasAtendidas = Array.from(new Set(cardsConcluidos.map((c) => c.categoria)));
  const comparativoDepois =
    listaMelhorias.length > 0
      ? `Após a implementação, foram concluídas ${cardsConcluidos.length} melhoria(s) em ${servicoNome}: ${formatarLista(listaMelhorias)}. As mudanças cobriram as categorias ${categoriasAtendidas.join(", ").toLowerCase()}, corrigindo os pontos de falha identificados na análise.`
      : `Após a implementação, nenhuma melhoria foi registrada como concluída neste ciclo de ${servicoNome}.`;

  return { comparativoAntes, comparativoDepois };
}

function formatarLista(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? "";
  return `${itens.slice(0, -1).join("; ")}; e ${itens[itens.length - 1]}`;
}
