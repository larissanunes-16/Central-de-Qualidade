"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { MANIFESTACAO_SIGILOSA } from "@/lib/ouvidoria/mock";

export function GraficoSigilosa() {
  const percentualSim = MANIFESTACAO_SIGILOSA.find((d) => d.nome === "Sim")?.valor ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Manifestação sigilosa</p>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <PieChart width={160} height={160}>
            <Pie
              data={MANIFESTACAO_SIGILOSA}
              dataKey="valor"
              nameKey="nome"
              cx={80}
              cy={80}
              innerRadius={47}
              outerRadius={72}
              stroke="#fcfcfb"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {MANIFESTACAO_SIGILOSA.map((entrada) => (
                <Cell key={entrada.nome} fill={entrada.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-800">{percentualSim}%</span>
            <span className="text-[11px] text-slate-400">Sigilosas</span>
          </div>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {MANIFESTACAO_SIGILOSA.map((entrada) => (
            <li key={entrada.nome} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entrada.cor }} />
              <span className="text-slate-600">{entrada.nome}</span>
              <span className="font-semibold tabular-nums text-slate-800">{entrada.valor}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
