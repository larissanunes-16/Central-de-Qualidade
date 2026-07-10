import clsx from "clsx";
import type { EstadoServico } from "@/types";

const ETAPAS: { estado: EstadoServico; label: string }[] = [
  { estado: "AGUARDANDO_ANALISE", label: "Importação" },
  { estado: "EM_ANALISE", label: "Análise" },
  { estado: "EM_MELHORIA", label: "Melhoria" },
  { estado: "CONCLUIDO", label: "Concluído" },
];

export function CicloTracker({ estado, compacto }: { estado: EstadoServico; compacto?: boolean }) {
  const indiceAtual = ETAPAS.findIndex((e) => e.estado === estado);

  return (
    <div className="flex items-center gap-1">
      {ETAPAS.map((etapa, index) => {
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
                status === "concluida" && "bg-emerald-500",
                status === "ativa" && "bg-brand-500",
                status === "futura" && "bg-slate-300",
              )}
            />
            {index < ETAPAS.length - 1 && <div className={clsx("h-px w-3", status === "concluida" ? "bg-emerald-300" : "bg-slate-200")} />}
          </div>
        );
      })}
    </div>
  );
}
