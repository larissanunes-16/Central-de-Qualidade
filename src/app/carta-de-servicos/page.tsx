"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import clsx from "clsx";
import { MetricCard } from "@/components/MetricCard";
import { ServicoCard } from "@/components/ServicoCard";
import { PainelLateralServico } from "@/components/PainelLateralServico";
import { ROTULOS_ESTADO_SERVICO } from "@/lib/constants";
import type { EstadoServico, Secretaria, Servico } from "@/types";

const FILTROS_ESTADO: { label: string; valor: EstadoServico | "TODOS" }[] = [
  { label: "Todos", valor: "TODOS" },
  { label: ROTULOS_ESTADO_SERVICO.PLANEJAMENTO, valor: "PLANEJAMENTO" },
  { label: ROTULOS_ESTADO_SERVICO.ANALISE_PREDITIVA, valor: "ANALISE_PREDITIVA" },
  { label: ROTULOS_ESTADO_SERVICO.AGUARDANDO_ANALISE, valor: "AGUARDANDO_ANALISE" },
  { label: ROTULOS_ESTADO_SERVICO.EM_ANALISE, valor: "EM_ANALISE" },
  { label: ROTULOS_ESTADO_SERVICO.EM_MELHORIA, valor: "EM_MELHORIA" },
  { label: ROTULOS_ESTADO_SERVICO.CONCLUIDO, valor: "CONCLUIDO" },
];

export default function CartaDeServicosPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando...</p>}>
      <CartaDeServicosConteudo />
    </Suspense>
  );
}

function CartaDeServicosConteudo() {
  const searchParams = useSearchParams();
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoServico | "TODOS">(
    (searchParams.get("estado") as EstadoServico | null) ?? "TODOS",
  );
  const [secretariasFiltro, setSecretariasFiltro] = useState<string[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, emAnalise: 0, emMelhoria: 0, concluidos: 0 });
  const [carregando, setCarregando] = useState(true);
  const [servicoSelecionado, setServicoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/secretarias").then((res) => res.json()).then(setSecretarias);
    fetch("/api/metrics").then((res) => res.json()).then(setMetrics);
  }, []);

  useEffect(() => {
    setCarregando(true);
    const params = new URLSearchParams();
    if (estadoFiltro !== "TODOS") params.append("estado", estadoFiltro);
    secretariasFiltro.forEach((id) => params.append("secretariaId", id));
    fetch(`/api/servicos?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setServicos(data);
        setCarregando(false);
      });
  }, [estadoFiltro, secretariasFiltro]);

  function alternarSecretaria(id: string) {
    setSecretariasFiltro((atual) => (atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id]));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carta de Serviços</h1>
          <p className="text-sm text-slate-500">Painel central com todos os serviços cadastrados e seus estados no ciclo de qualidade.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/servicos/novo" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Novo serviço
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total de serviços" value={metrics.total} />
        <MetricCard label="Em análise" value={metrics.emAnalise} />
        <MetricCard label="Em melhoria" value={metrics.emMelhoria} />
        <MetricCard label="Concluídos" value={metrics.concluidos} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {FILTROS_ESTADO.map((filtro) => (
          <button
            key={filtro.valor}
            onClick={() => setEstadoFiltro(filtro.valor)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              estadoFiltro === filtro.valor ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {secretarias.map((secretaria) => (
          <button
            key={secretaria.id}
            onClick={() => alternarSecretaria(secretaria.id)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium",
              secretariasFiltro.includes(secretaria.id)
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50",
            )}
          >
            {secretaria.nome}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="text-sm text-slate-400">Carregando serviços...</p>
      ) : servicos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          Nenhum serviço encontrado para os filtros selecionados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servicos.map((servico) => (
            <ServicoCard key={servico.id} servico={servico} onAbrir={() => setServicoSelecionado(servico.id)} />
          ))}
        </div>
      )}

      {servicoSelecionado && (
        <PainelLateralServico servicoId={servicoSelecionado} onFechar={() => setServicoSelecionado(null)} />
      )}
    </div>
  );
}
