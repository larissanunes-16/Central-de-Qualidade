"use client";

import Link from "next/link";
import { CicloTracker } from "./CicloTracker";
import { EstadoBadge } from "./EstadoBadge";
import type { Servico } from "@/types";

export function ServicoCard({ servico, onAbrir }: { servico: Servico; onAbrir: () => void }) {
  const ciclo = servico.cicloAtual;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
      <button onClick={onAbrir} className="flex flex-col gap-2 text-left">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-800">{servico.nome}</p>
          <EstadoBadge estado={servico.estado} />
        </div>
        <p className="text-xs text-slate-500">{servico.secretaria.nome}</p>
        <CicloTracker estado={servico.estado} />
        {ciclo && servico.estado === "EM_MELHORIA" && (
          <div className="mt-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${ciclo.percentualConclusao}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{ciclo.percentualConclusao}% das melhorias concluídas</p>
          </div>
        )}
        {ciclo && (
          <p className="text-[11px] text-slate-400">
            Responsável: {ciclo.responsavelAnalise || "—"} · v{Math.max(servico.versaoAtual, ciclo.versao)}
          </p>
        )}
      </button>

      {servico.estado === "AGUARDANDO_ANALISE" && (
        <Link
          href={`/servicos/${servico.id}/importar`}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-700"
        >
          Iniciar análise
        </Link>
      )}
      {servico.estado === "PLANEJAMENTO" && (
        <Link
          href={`/servicos/${servico.id}/planejamento`}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-violet-700"
        >
          Continuar planejamento
        </Link>
      )}
      {servico.estado === "ANALISE_PREDITIVA" && (
        <Link
          href={`/servicos/${servico.id}/analise-preditiva`}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-violet-700"
        >
          Ver análise preditiva
        </Link>
      )}
    </div>
  );
}
