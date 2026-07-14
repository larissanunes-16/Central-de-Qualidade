"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";
import { COR_RECEBIDAS, COR_RESPONDIDAS, DADOS_POR_MES } from "@/lib/ouvidoria/mock";

export function GraficosMensais() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Manifestações por mês</p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COR_RECEBIDAS }} />
            Recebidas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COR_RESPONDIDAS }} />
            Respondidas
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {DADOS_POR_MES.map((dado) => (
          <div key={dado.mes} className="flex flex-col items-center gap-1">
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[dado]} margin={{ top: 4, right: 2, bottom: 0, left: 2 }} barGap={3}>
                  <Tooltip
                    cursor={false}
                    formatter={(value, nome) => [Number(value).toLocaleString("pt-BR"), nome === "recebidas" ? "Recebidas" : "Respondidas"]}
                    labelFormatter={() => dado.mes}
                  />
                  <Bar dataKey="recebidas" fill={COR_RECEBIDAS} radius={[2, 2, 0, 0]} maxBarSize={14} isAnimationActive={false} />
                  <Bar dataKey="respondidas" fill={COR_RESPONDIDAS} radius={[2, 2, 0, 0]} maxBarSize={14} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] font-medium text-slate-500">{dado.mes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
