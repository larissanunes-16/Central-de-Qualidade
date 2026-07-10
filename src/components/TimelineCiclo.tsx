import type { Ciclo } from "@/types";

function formatarData(data: string | null) {
  return data ? new Date(data).toLocaleDateString("pt-BR") : "—";
}

export function TimelineCiclo({ ciclo }: { ciclo: Ciclo }) {
  const dataMelhoriaConcluida = ciclo.cards.length
    ? ciclo.cards.reduce<string | null>((maisRecente, card) => {
        if (!card.concluidoEm) return maisRecente;
        if (!maisRecente || new Date(card.concluidoEm) > new Date(maisRecente)) return card.concluidoEm;
        return maisRecente;
      }, null)
    : ciclo.dataConclusao;

  const etapas = [
    { label: "Importação", data: ciclo.dataInicio },
    { label: "Análise", data: ciclo.relatorio?.geradoEm ?? null },
    { label: "Melhoria", data: dataMelhoriaConcluida },
    { label: "Concluído", data: ciclo.dataConclusao },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {etapas.map((etapa) => (
        <div key={etapa.label} className="flex items-center gap-2 text-xs text-slate-500">
          <span className={etapa.data ? "text-emerald-500" : "text-slate-300"}>✓</span>
          <span className="font-medium text-slate-600">{etapa.label}</span>
          <span>{formatarData(etapa.data)}</span>
        </div>
      ))}
    </div>
  );
}
