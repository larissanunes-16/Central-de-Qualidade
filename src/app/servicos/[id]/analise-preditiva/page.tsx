"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RelatorioViewer } from "@/components/RelatorioViewer";
import { Modal } from "@/components/Modal";
import type { Ciclo, Relatorio } from "@/types";

export default function AnalisePreditivaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [servicoNome, setServicoNome] = useState("");
  const [secretariaNome, setSecretariaNome] = useState("");
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [lancando, setLancando] = useState(false);
  const cicloIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetch(`/api/servicos/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setServicoNome(data.nome);
        setSecretariaNome(data.secretaria.nome);
        cicloIdRef.current = data.cicloAtual?.id ?? null;
        if (!cicloIdRef.current) {
          setErro("Nenhum ciclo de análise preditiva encontrado para este serviço.");
        }
      });
  }, [params.id]);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | null = null;

    function carregarCiclo() {
      if (!cicloIdRef.current) return;
      fetch(`/api/ciclos/${cicloIdRef.current}`)
        .then((res) => res.json())
        .then((data: Ciclo & { processando: boolean }) => {
          setCiclo(data);
          if (!data.processando && intervalo) {
            clearInterval(intervalo);
          }
        });
    }

    const esperar = setTimeout(() => {
      carregarCiclo();
      intervalo = setInterval(carregarCiclo, 800);
    }, 300);

    return () => {
      clearTimeout(esperar);
      if (intervalo) clearInterval(intervalo);
    };
  }, [params.id]);

  async function tentarNovamente() {
    setErro(null);
    const res = await fetch(`/api/servicos/${params.id}/analise-preditiva`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.erro ?? "Não foi possível processar a análise.");
      return;
    }
    router.refresh();
    window.location.reload();
  }

  async function salvarEdicao(dados: Pick<Relatorio, "jornada" | "pontosFalha" | "momentosVerdade" | "recomendacoes">) {
    if (!ciclo?.relatorio) return;
    await fetch(`/api/relatorios/${ciclo.relatorio.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const res = await fetch(`/api/ciclos/${ciclo.id}`);
    setCiclo(await res.json());
  }

  async function confirmarLancamento() {
    setLancando(true);
    const res = await fetch(`/api/servicos/${params.id}/lancar`, { method: "POST" });
    const data = await res.json();
    setLancando(false);
    if (!res.ok) {
      setErro(data.erro ?? "Não foi possível lançar o serviço.");
      setModalAberto(false);
      return;
    }
    router.push(`/servicos/${params.id}/importar`);
  }

  const relatorio = ciclo?.relatorio ?? null;
  const processando =
    (ciclo as (Ciclo & { processando?: boolean }) | null)?.processando ?? (Boolean(cicloIdRef.current) && !relatorio);
  const percentualEstimado = (ciclo as (Ciclo & { percentualEstimado?: number }) | null)?.percentualEstimado ?? 0;

  const contagemPorPrioridade = relatorio
    ? relatorio.pontosFalha.reduce<Record<string, number>>((acc, p) => {
        acc[p.prioridade] = (acc[p.prioridade] ?? 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Análise de Riscos Previstos</h1>
          <p className="text-sm text-slate-500">{servicoNome ? `${servicoNome} · ${secretariaNome}` : "Carregando serviço..."}</p>
          {ciclo && (
            <p className="mt-1 text-xs text-slate-400">
              Versão do ciclo v{ciclo.versao} · Gerado em {relatorio ? new Date(relatorio.geradoEm).toLocaleDateString("pt-BR") : "—"} ·{" "}
              {Object.entries(contagemPorPrioridade)
                .map(([p, qtd]) => `${qtd} ${p.toLowerCase()}`)
                .join(", ")}
            </p>
          )}
        </div>

        {relatorio && (
          <div className="flex gap-2">
            <a
              href={`/api/relatorios/${relatorio.id}/exportar?formato=pdf`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Exportar PDF
            </a>
            <a
              href={`/api/relatorios/${relatorio.id}/exportar?formato=docx`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Exportar Word
            </a>
            <button
              onClick={() => setModalAberto(true)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Lançar serviço
            </button>
          </div>
        )}
      </div>

      {erro && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <p className="mb-2">{erro}</p>
          <button onClick={tentarNovamente} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
            Tentar novamente
          </button>
        </div>
      )}

      {!erro && processando && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="mb-3 text-sm font-medium text-slate-600">Analisando riscos previstos com IA...</p>
          <div className="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${percentualEstimado}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">{percentualEstimado}% concluído</p>
        </div>
      )}

      {!erro && !processando && relatorio && (
        <RelatorioViewer relatorio={relatorio} editavel onSalvar={salvarEdicao} tipo="PREDITIVO" />
      )}

      <Modal aberto={modalAberto} titulo="Lançar serviço" onFechar={() => setModalAberto(false)}>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">
            Isso arquiva a análise preditiva no histórico e inicia a coleta de evidências reais deste serviço, já em operação.
          </p>
          <button
            onClick={confirmarLancamento}
            disabled={lancando}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {lancando ? "Lançando..." : "Confirmar lançamento"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
