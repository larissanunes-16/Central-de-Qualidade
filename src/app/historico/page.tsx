"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ComparativoAntesDepois } from "@/components/ComparativoAntesDepois";
import { TimelineCiclo } from "@/components/TimelineCiclo";
import type { Ciclo, Secretaria } from "@/types";

type CicloHistorico = Ciclo & { servico: { id: string; nome: string; secretaria: Secretaria } };

export default function HistoricoPage() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [secretariaFiltro, setSecretariaFiltro] = useState<string | null>(null);
  const [ciclos, setCiclos] = useState<CicloHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/secretarias").then((res) => res.json()).then(setSecretarias);
  }, []);

  useEffect(() => {
    setCarregando(true);
    const params = new URLSearchParams();
    if (secretariaFiltro) params.append("secretariaId", secretariaFiltro);
    fetch(`/api/historico?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCiclos(data);
        setCarregando(false);
      });
  }, [secretariaFiltro]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Histórico</h1>
        <p className="text-sm text-slate-500">Registro completo de todos os ciclos concluídos, do mais recente ao mais antigo.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSecretariaFiltro(null)}
          className={clsx("rounded-full border px-3 py-1 text-xs font-medium", !secretariaFiltro ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50")}
        >
          Todas as secretarias
        </button>
        {secretarias.map((s) => (
          <button
            key={s.id}
            onClick={() => setSecretariaFiltro(s.id)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium",
              secretariaFiltro === s.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50",
            )}
          >
            {s.nome}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="text-sm text-slate-400">Carregando histórico...</p>
      ) : ciclos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">Nenhum ciclo concluído ainda.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {ciclos.map((ciclo) => (
            <Link key={ciclo.id} href={`/historico/${ciclo.id}`} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{ciclo.servico.nome}</p>
                  <p className="text-xs text-slate-500">
                    {ciclo.servico.secretaria.nome} · v{ciclo.versao}
                  </p>
                </div>
                <span className="badge bg-emerald-100 text-emerald-700">Concluído</span>
              </div>
              <TimelineCiclo ciclo={ciclo} />
              <ComparativoAntesDepois antes={ciclo.comparativoAntes} depois={ciclo.comparativoDepois} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
