import clsx from "clsx";
import { ROTULOS_ESTADO_SERVICO } from "@/lib/constants";
import type { EstadoServico } from "@/types";

const CORES: Record<EstadoServico, string> = {
  PLANEJAMENTO: "bg-violet-100 text-violet-700",
  ANALISE_PREDITIVA: "bg-indigo-100 text-indigo-700",
  AGUARDANDO_ANALISE: "bg-slate-100 text-slate-600",
  EM_ANALISE: "bg-brand-100 text-brand-700",
  EM_MELHORIA: "bg-amber-100 text-amber-700",
  CONCLUIDO: "bg-emerald-100 text-emerald-700",
};

export function EstadoBadge({ estado }: { estado: EstadoServico }) {
  return (
    <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", CORES[estado])}>
      {ROTULOS_ESTADO_SERVICO[estado]}
    </span>
  );
}
