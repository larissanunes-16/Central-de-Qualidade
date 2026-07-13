"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ComparativoAntesDepois } from "@/components/ComparativoAntesDepois";
import { TimelineCiclo } from "@/components/TimelineCiclo";
import { RelatorioViewer } from "@/components/RelatorioViewer";
import type { Ciclo, Secretaria } from "@/types";

type CicloDetalhado = Ciclo & { servico: { id: string; nome: string; estado: string; secretaria: Secretaria } };

export default function HistoricoDetalhePage({ params }: { params: { cicloId: string } }) {
  const [ciclo, setCiclo] = useState<CicloDetalhado | null>(null);

  useEffect(() => {
    fetch(`/api/ciclos/${params.cicloId}`)
      .then((res) => res.json())
      .then(setCiclo);
  }, [params.cicloId]);

  if (!ciclo) return <p className="text-sm text-slate-400">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/historico" className="text-sm text-brand-600 hover:underline">
          ← Voltar ao histórico
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">
          {ciclo.servico.nome} · v{ciclo.versao}
        </h1>
        <p className="text-sm text-slate-500">{ciclo.servico.secretaria.nome}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Linha do tempo do ciclo</p>
        <TimelineCiclo ciclo={ciclo} />
      </div>

      {ciclo.tipo === "PREDITIVO" ? (
        <div className="rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-700">
          Este foi o ciclo de planejamento deste serviço, antes do lançamento — não há comparativo antes/depois aqui, ele aparece no ciclo diagnóstico seguinte.
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Comparativo antes/depois</p>
          <ComparativoAntesDepois antes={ciclo.comparativoAntes} depois={ciclo.comparativoDepois} />
        </div>
      )}

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Membros participantes</p>
        <p className="text-sm text-slate-600">{ciclo.membrosParticipantes.join(", ") || "—"}</p>
      </div>

      {ciclo.relatorio && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {ciclo.tipo === "PREDITIVO" ? "Análise de riscos previstos original" : "Relatório de achados original"}
            </p>
            <div className="flex gap-2">
              <a href={`/api/relatorios/${ciclo.relatorio.id}/exportar?formato=pdf`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                Exportar PDF
              </a>
              <a href={`/api/relatorios/${ciclo.relatorio.id}/exportar?formato=docx`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                Exportar Word
              </a>
            </div>
          </div>
          <RelatorioViewer relatorio={ciclo.relatorio} editavel={false} tipo={ciclo.tipo === "PREDITIVO" ? "PREDITIVO" : "DIAGNOSTICO"} />
        </div>
      )}
    </div>
  );
}
