"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Relatorio } from "@/types";

const CORES_PRIORIDADE: Record<string, string> = {
  Alta: "bg-red-100 text-red-700",
  Média: "bg-amber-100 text-amber-700",
  Baixa: "bg-slate-100 text-slate-600",
};

const EMOJI_EMOCAO: Record<string, string> = {
  Satisfeito: "🙂",
  Neutro: "😐",
  Frustrado: "😞",
  Confuso: "😕",
};

export function RelatorioViewer({
  relatorio,
  editavel,
  onSalvar,
}: {
  relatorio: Relatorio;
  editavel: boolean;
  onSalvar?: (dados: Pick<Relatorio, "jornada" | "pontosFalha" | "momentosVerdade" | "recomendacoes">) => Promise<void>;
}) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [jornada, setJornada] = useState(relatorio.jornada);
  const [pontosFalha, setPontosFalha] = useState(relatorio.pontosFalha);
  const [momentosVerdade, setMomentosVerdade] = useState(relatorio.momentosVerdade);
  const [recomendacoes, setRecomendacoes] = useState(relatorio.recomendacoes);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!onSalvar) return;
    setSalvando(true);
    await onSalvar({ jornada, pontosFalha, momentosVerdade, recomendacoes });
    setSalvando(false);
    setModoEdicao(false);
  }

  return (
    <div className="flex flex-col gap-8">
      {editavel && (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">
            {relatorio.editadoManualmente ? "Este relatório já foi editado manualmente." : "Relatório gerado automaticamente pela IA."}
          </p>
          {modoEdicao ? (
            <div className="flex gap-2">
              <button onClick={() => setModoEdicao(false)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                {salvando ? "Salvando..." : "Salvar edições"}
              </button>
            </div>
          ) : (
            <button onClick={() => setModoEdicao(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Editar seções
            </button>
          )}
        </div>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Jornada do usuário</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {jornada.map((etapa, index) => (
            <div
              key={index}
              className={clsx(
                "flex min-w-[180px] flex-col gap-1 rounded-xl border p-3",
                etapa.falha ? "border-red-200 bg-red-50" : "border-slate-200 bg-white",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{etapa.etapa}</p>
                <span title={etapa.emocao}>{EMOJI_EMOCAO[etapa.emocao] ?? "🙂"}</span>
              </div>
              {modoEdicao ? (
                <textarea
                  value={etapa.descricao}
                  onChange={(e) => {
                    const copia = [...jornada];
                    copia[index] = { ...etapa, descricao: e.target.value };
                    setJornada(copia);
                  }}
                  className="rounded border border-slate-200 p-1 text-xs"
                  rows={3}
                />
              ) : (
                <p className="text-xs text-slate-500">{etapa.descricao}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Matriz de priorização — pontos de falha</h3>
        <div className="flex flex-col gap-3">
          {pontosFalha.map((ponto, index) => (
            <div key={ponto.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-semibold text-slate-800">{ponto.titulo}</p>
                <span className={clsx("badge", CORES_PRIORIDADE[ponto.prioridade])}>{ponto.prioridade}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{ponto.categoria}</span>
              </div>
              {modoEdicao ? (
                <textarea
                  value={ponto.descricao}
                  onChange={(e) => {
                    const copia = [...pontosFalha];
                    copia[index] = { ...ponto, descricao: e.target.value };
                    setPontosFalha(copia);
                  }}
                  className="w-full rounded border border-slate-200 p-2 text-sm"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-slate-600">{ponto.descricao}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                Impacto: <strong>{ponto.impacto}</strong> · Esforço: <strong>{ponto.esforco}</strong>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Momentos da verdade</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {momentosVerdade.map((momento, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-semibold text-slate-800">{momento.titulo}</p>
                <span
                  className={clsx(
                    "badge",
                    momento.nivelRisco === "Alto" ? "bg-red-100 text-red-700" : momento.nivelRisco === "Médio" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600",
                  )}
                >
                  Risco {momento.nivelRisco}
                </span>
              </div>
              <p className="text-sm text-slate-600">{momento.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Recomendações</h3>
        <div className="flex flex-col gap-3">
          {recomendacoes.map((rec, index) => (
            <div key={rec.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-semibold text-slate-800">{rec.titulo}</p>
                <span className={clsx("badge", CORES_PRIORIDADE[rec.prioridade])}>{rec.prioridade}</span>
              </div>
              {modoEdicao ? (
                <textarea
                  value={rec.descricao}
                  onChange={(e) => {
                    const copia = [...recomendacoes];
                    copia[index] = { ...rec, descricao: e.target.value };
                    setRecomendacoes(copia);
                  }}
                  className="w-full rounded border border-slate-200 p-2 text-sm"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-slate-600">{rec.descricao}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {relatorio.layoutSugerido && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Layout inicial sugerido</h3>
          <div className="flex flex-col gap-3">
            {relatorio.layoutSugerido.secoes.map((s, index) => (
              <div key={index} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-800">{s.titulo}</p>
                <p className="text-sm text-slate-600">{s.descricao}</p>
              </div>
            ))}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">Boas práticas</p>
              <ul className="list-inside list-disc text-sm text-slate-600">
                {relatorio.layoutSugerido.boasPraticas.map((b, index) => (
                  <li key={index}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
