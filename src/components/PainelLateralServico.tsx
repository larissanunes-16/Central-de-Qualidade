"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CicloTracker } from "./CicloTracker";
import { EstadoBadge } from "./EstadoBadge";
import type { ServicoDetalhado } from "@/types";

export function PainelLateralServico({ servicoId, onFechar }: { servicoId: string; onFechar: () => void }) {
  const [servico, setServico] = useState<ServicoDetalhado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    fetch(`/api/servicos/${servicoId}`)
      .then((res) => res.json())
      .then((data) => {
        setServico(data);
        setCarregando(false);
      });
  }, [servicoId]);

  const ciclo = servico?.cicloAtual ?? null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Detalhes do serviço</h2>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600" aria-label="Fechar">
            ✕
          </button>
        </div>

        {carregando || !servico ? (
          <p className="text-sm text-slate-400">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xl font-bold text-slate-800">{servico.nome}</p>
              <p className="text-sm text-slate-500">{servico.secretaria.nome}</p>
              <div className="mt-2 flex items-center gap-2">
                <EstadoBadge estado={servico.estado} />
                <span className="text-xs text-slate-400">v{servico.versaoAtual || ciclo?.versao || 1}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Ciclo de qualidade</p>
              <CicloTracker estado={servico.estado} />
            </div>

            {ciclo && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <p>Responsável pela análise: {ciclo.responsavelAnalise || "—"}</p>
                {ciclo.tipo === "PREDITIVO" ? (
                  <p>Etapas previstas: {ciclo.etapasPrevistas.length}</p>
                ) : (
                  <p>Documentos importados: {ciclo.documentos.length}</p>
                )}
                {servico.estado === "EM_MELHORIA" && (
                  <p>Progresso das melhorias: {ciclo.percentualConclusao}% ({ciclo.cardsConcluidos}/{ciclo.totalCards})</p>
                )}
              </div>
            )}

            {ciclo?.relatorio && ciclo.relatorio.pontosFalha.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {ciclo.tipo === "PREDITIVO" ? "Riscos previstos identificados" : "Pontos de falha identificados"}
                </p>
                <ul className="flex flex-col gap-2">
                  {ciclo.relatorio.pontosFalha.map((ponto) => (
                    <li key={ponto.id} className="rounded-lg border border-slate-200 p-2 text-sm">
                      <p className="font-medium text-slate-700">{ponto.titulo}</p>
                      <p className="text-xs text-slate-400">
                        {ponto.categoria} · Prioridade {ponto.prioridade}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {servico.estado === "PLANEJAMENTO" && (
                <Link href={`/servicos/${servico.id}/planejamento`} className="rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-violet-700">
                  Continuar planejamento
                </Link>
              )}
              {servico.estado === "ANALISE_PREDITIVA" && (
                <Link href={`/servicos/${servico.id}/analise-preditiva`} className="rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-violet-700">
                  Ver análise preditiva
                </Link>
              )}
              {servico.estado === "AGUARDANDO_ANALISE" && (
                <Link href={`/servicos/${servico.id}/importar`} className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                  Ir para importação
                </Link>
              )}
              {servico.estado === "EM_ANALISE" && (
                <Link href={`/servicos/${servico.id}/analise`} className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                  Ver relatório de achados
                </Link>
              )}
              {servico.estado === "EM_MELHORIA" && (
                <Link href={`/servicos/${servico.id}/materializacao`} className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                  Ir para materialização
                </Link>
              )}
              {servico.estado === "CONCLUIDO" && ciclo && (
                <Link href={`/historico/${ciclo.id}`} className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                  Ver no histórico
                </Link>
              )}

              {ciclo?.relatorio && (
                <div className="flex gap-2">
                  <a
                    href={`/api/relatorios/${ciclo.relatorio.id}/exportar?formato=pdf`}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Exportar PDF
                  </a>
                  <a
                    href={`/api/relatorios/${ciclo.relatorio.id}/exportar?formato=docx`}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Exportar Word
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
