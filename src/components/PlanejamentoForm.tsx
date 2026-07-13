"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { CANAIS_SERVICO_OPCOES } from "@/lib/constants";
import type { Secretaria, ServicoDetalhado } from "@/types";

type Props = { servicoId?: string };

type Erros = {
  nome?: string;
  secretariaId?: string;
  responsavelAnalise?: string;
  objetivoServico?: string;
  publicoAlvo?: string;
  etapasPrevistas?: string;
};

export function PlanejamentoForm({ servicoId }: Props) {
  const router = useRouter();
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [nome, setNome] = useState("");
  const [secretariaId, setSecretariaId] = useState("");
  const [responsavelAnalise, setResponsavelAnalise] = useState("");
  const [objetivoServico, setObjetivoServico] = useState("");
  const [publicoAlvo, setPublicoAlvo] = useState("");
  const [etapasPrevistas, setEtapasPrevistas] = useState<string[]>([]);
  const [novaEtapa, setNovaEtapa] = useState("");
  const [canaisPrevistos, setCanaisPrevistos] = useState<string[]>([]);
  const [integracoesPrevistas, setIntegracoesPrevistas] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState<"rascunho" | "analise" | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/secretarias").then((res) => res.json()).then(setSecretarias);
  }, []);

  useEffect(() => {
    if (!servicoId) return;
    fetch(`/api/servicos/${servicoId}`)
      .then((res) => res.json())
      .then((data: ServicoDetalhado) => {
        setNome(data.nome);
        setSecretariaId(data.secretaria.id);
        setResponsavelAnalise(data.cicloAtual?.responsavelAnalise ?? "");
        setObjetivoServico(data.cicloAtual?.objetivoServico ?? "");
        setPublicoAlvo(data.cicloAtual?.publicoAlvo ?? "");
        setEtapasPrevistas(data.cicloAtual?.etapasPrevistas ?? []);
        setCanaisPrevistos(data.cicloAtual?.canaisPrevistos ?? []);
        setIntegracoesPrevistas(data.cicloAtual?.integracoesPrevistas ?? "");
      });
  }, [servicoId]);

  function adicionarEtapa() {
    if (!novaEtapa.trim()) return;
    setEtapasPrevistas((atual) => [...atual, novaEtapa.trim()]);
    setNovaEtapa("");
  }

  function removerEtapa(index: number) {
    setEtapasPrevistas((atual) => atual.filter((_, i) => i !== index));
  }

  function alternarCanal(canal: string) {
    setCanaisPrevistos((atual) => (atual.includes(canal) ? atual.filter((c) => c !== canal) : [...atual, canal]));
  }

  function validar(exigirCompleto: boolean): boolean {
    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do serviço.";
    if (!secretariaId) novosErros.secretariaId = "Selecione a secretaria responsável.";
    if (!responsavelAnalise.trim()) novosErros.responsavelAnalise = "Informe ao menos um responsável pela análise.";
    if (exigirCompleto) {
      if (!objetivoServico.trim()) novosErros.objetivoServico = "Descreva o objetivo do serviço.";
      if (!publicoAlvo.trim()) novosErros.publicoAlvo = "Descreva o público-alvo.";
      if (etapasPrevistas.length === 0) novosErros.etapasPrevistas = "Informe ao menos 1 etapa prevista da jornada.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function montarBody() {
    return {
      nome: nome.trim(),
      secretariaId,
      responsavelAnalise: responsavelAnalise.trim(),
      objetivoServico: objetivoServico.trim(),
      publicoAlvo: publicoAlvo.trim(),
      etapasPrevistas,
      canaisPrevistos,
      integracoesPrevistas: integracoesPrevistas.trim(),
    };
  }

  async function salvarRascunho() {
    if (!validar(false)) return;
    setEnviando("rascunho");
    setErroGeral(null);
    try {
      if (!servicoId) {
        const res = await fetch("/api/servicos/planejamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...montarBody(), gerarAnalise: false }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
      } else {
        const res = await fetch(`/api/servicos/${servicoId}/planejamento`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(montarBody()),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
      }
      router.push("/carta-de-servicos");
    } catch (error) {
      setErroGeral(error instanceof Error ? error.message : "Não foi possível salvar o rascunho.");
    } finally {
      setEnviando(null);
    }
  }

  async function gerarAnalisePreditiva() {
    if (!validar(true)) return;
    setEnviando("analise");
    setErroGeral(null);
    try {
      let idServico = servicoId;
      if (!idServico) {
        const res = await fetch("/api/servicos/planejamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...montarBody(), gerarAnalise: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
        idServico = data.id;
      } else {
        const patchRes = await fetch(`/api/servicos/${servicoId}/planejamento`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(montarBody()),
        });
        const patchData = await patchRes.json();
        if (!patchRes.ok) throw new Error(patchData.erro);

        const res = await fetch(`/api/servicos/${idServico}/analise-preditiva`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
      }
      router.push(`/servicos/${idServico}/analise-preditiva`);
    } catch (error) {
      setErroGeral(error instanceof Error ? error.message : "Não foi possível gerar a análise preditiva.");
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p className="rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-700">
        Este serviço ainda não existe — a IA vai gerar uma análise de riscos previstos a partir da descrição abaixo, em vez de diagnosticar falhas reais.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Nome do serviço *</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Ex.: Agendamento Online de Podas de Árvores"
        />
        {erros.nome && <p className="text-xs text-red-600">{erros.nome}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Secretaria responsável *</label>
        <select
          value={secretariaId}
          onChange={(e) => setSecretariaId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Selecione...</option>
          {secretarias.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
        {erros.secretariaId && <p className="text-xs text-red-600">{erros.secretariaId}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Responsável pela análise *</label>
        <input
          value={responsavelAnalise}
          onChange={(e) => setResponsavelAnalise(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Nome do analista responsável"
        />
        {erros.responsavelAnalise && <p className="text-xs text-red-600">{erros.responsavelAnalise}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Qual é o objetivo do serviço? *</label>
        <textarea
          value={objetivoServico}
          onChange={(e) => setObjetivoServico(e.target.value)}
          rows={3}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="O que esse serviço deve resolver para o cidadão?"
        />
        {erros.objetivoServico && <p className="text-xs text-red-600">{erros.objetivoServico}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Quem é o público-alvo? *</label>
        <textarea
          value={publicoAlvo}
          onChange={(e) => setPublicoAlvo(e.target.value)}
          rows={2}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Ex.: Moradores com árvores em vias públicas próximas à residência"
        />
        {erros.publicoAlvo && <p className="text-xs text-red-600">{erros.publicoAlvo}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Quais são as etapas previstas da jornada? *</label>
        {etapasPrevistas.length > 0 && (
          <ul className="flex flex-col gap-2">
            {etapasPrevistas.map((etapa, index) => (
              <li key={index} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span className="truncate text-slate-700">
                  {index + 1}. {etapa}
                </span>
                <button onClick={() => removerEtapa(index)} className="text-xs font-medium text-red-500 hover:text-red-700">
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            value={novaEtapa}
            onChange={(e) => setNovaEtapa(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarEtapa();
              }
            }}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Ex.: Solicitação feita pelo aplicativo"
          />
          <button onClick={adicionarEtapa} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
            Adicionar
          </button>
        </div>
        {erros.etapasPrevistas && <p className="text-xs text-red-600">{erros.etapasPrevistas}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Quais canais serão usados?</label>
        <div className="flex flex-wrap gap-2">
          {CANAIS_SERVICO_OPCOES.map((canal) => (
            <button
              key={canal}
              type="button"
              onClick={() => alternarCanal(canal)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-medium",
                canaisPrevistos.includes(canal)
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50",
              )}
            >
              {canal}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Quais sistemas ou integrações estão envolvidos? (opcional)</label>
        <textarea
          value={integracoesPrevistas}
          onChange={(e) => setIntegracoesPrevistas(e.target.value)}
          rows={2}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Ex.: Integração com o sistema de cadastro municipal"
        />
      </div>

      {erroGeral && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erroGeral}</p>}

      <div className="flex gap-3">
        <button
          onClick={salvarRascunho}
          disabled={enviando !== null}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {enviando === "rascunho" ? "Salvando..." : "Salvar rascunho"}
        </button>
        <button
          onClick={gerarAnalisePreditiva}
          disabled={enviando !== null}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {enviando === "analise" ? "Gerando..." : "Gerar análise preditiva"}
        </button>
      </div>
    </div>
  );
}
