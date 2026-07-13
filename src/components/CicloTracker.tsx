import clsx from "clsx";
import { ESTADOS_PRE_LANCAMENTO } from "@/lib/constants";
import type { EstadoServico } from "@/types";

const ETAPAS_PRE_LANCAMENTO: { estado: EstadoServico; label: string }[] = [
  { estado: "PLANEJAMENTO", label: "Planejamento" },
  { estado: "ANALISE_PREDITIVA", label: "Análise preditiva" },
];

const ETAPAS_POS_LANCAMENTO: { estado: EstadoServico; label: string }[] = [
  { estado: "AGUARDANDO_ANALISE", label: "Importação" },
  { estado: "EM_ANALISE", label: "Análise" },
  { estado: "EM_MELHORIA", label: "Melhoria" },
  { estado: "CONCLUIDO", label: "Concluído" },
];

export function CicloTracker({ estado, compacto }: { estado: EstadoServico; compacto?: boolean }) {
  const preLancamento = (ESTADOS_PRE_LANCAMENTO as readonly string[]).includes(estado);
  const etapas = preLancamento ? ETAPAS_PRE_LANCAMENTO : ETAPAS_POS_LANCAMENTO;
  const indiceAtual = etapas.findIndex((e) => e.estado === estado);

  return (
    <div className="flex items-center gap-1">
      {etapas.map((etapa, index) => {
        const status =
          estado === "CONCLUIDO" || index < indiceAtual
            ? "concluida"
            : index === indiceAtual
              ? "ativa"
              : "futura";
        return (
          <div key={etapa.estado} className="flex items-center gap-1">
            <div
              title={etapa.label}
              className={clsx(
                "rounded-full",
                compacto ? "h-2 w-2" : "h-2.5 w-2.5",
                status === "concluida" && (preLancamento ? "bg-violet-500" : "bg-emerald-500"),
                status === "ativa" && (preLancamento ? "bg-violet-500" : "bg-brand-500"),
                status === "futura" && "bg-slate-300",
              )}
            />
            {index < etapas.length - 1 && (
              <div className={clsx("h-px w-3", status === "concluida" ? (preLancamento ? "bg-violet-300" : "bg-emerald-300") : "bg-slate-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
