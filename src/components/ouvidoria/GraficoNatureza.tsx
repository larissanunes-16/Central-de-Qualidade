"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR_MAGNITUDE, NATUREZA_MANIFESTACAO } from "@/lib/ouvidoria/mock";

export function GraficoNatureza() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Natureza da manifestação</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={NATUREZA_MANIFESTACAO} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="#e1e0d9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#898781" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="natureza"
              width={110}
              tick={{ fontSize: 11, fill: "#52514e" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR")} />
            <Bar dataKey="total" fill={COR_MAGNITUDE} radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
