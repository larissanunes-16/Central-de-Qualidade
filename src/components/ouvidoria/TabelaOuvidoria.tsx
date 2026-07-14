"use client";

import { useState } from "react";
import clsx from "clsx";
import { ABAS_TABELA_OUVIDORIA, CORES_SENTIMENTO, DADOS_TABELA_OUVIDORIA, type AbaTabelaOuvidoria } from "@/lib/ouvidoria/mock";

export function TabelaOuvidoria() {
  const [aba, setAba] = useState<AbaTabelaOuvidoria>("Órgão");
  const linhas = DADOS_TABELA_OUVIDORIA[aba];

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap border-b border-slate-200">
        {ABAS_TABELA_OUVIDORIA.map((item) => (
          <button
            key={item}
            onClick={() => setAba(item)}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium",
              aba === item ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">{aba}</th>
              <th className="px-4 py-3 text-right">Negativo</th>
              <th className="px-4 py-3 text-right">Neutro</th>
              <th className="px-4 py-3 text-right">Positivo</th>
              <th className="px-4 py-3 text-right">% Negativo</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.rotulo} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 text-slate-700">{linha.rotulo}</td>
                <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: CORES_SENTIMENTO.negativo }}>
                  {linha.negativo.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">{linha.neutro.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: CORES_SENTIMENTO.positivo }}>
                  {linha.positivo.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{linha.percentualNegativo}%</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-800">{linha.total.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
