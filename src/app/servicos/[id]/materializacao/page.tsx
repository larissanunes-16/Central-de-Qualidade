"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProgressRing } from "@/components/ProgressRing";
import { Modal } from "@/components/Modal";
import { useUsuarioAtual } from "@/components/UsuarioAtualProvider";
import type { CardMelhoria, Ciclo, EstadoCard, ServicoDetalhado } from "@/types";

export default function MaterializacaoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { usuarioAtualId } = useUsuarioAtual();
  const [servico, setServico] = useState<ServicoDetalhado | null>(null);
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [cards, setCards] = useState<CardMelhoria[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [comparativoAntes, setComparativoAntes] = useState("");
  const [comparativoDepois, setComparativoDepois] = useState("");
  const [concluindo, setConcluindo] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);
  const [gerandoComparativo, setGerandoComparativo] = useState(false);

  useEffect(() => {
    fetch(`/api/servicos/${params.id}`)
      .then((res) => res.json())
      .then((data: ServicoDetalhado) => {
        setServico(data);
        setCiclo(data.cicloAtual);
        setCards(data.cicloAtual?.cards ?? []);
      });
  }, [params.id]);

  async function onMoverCard(cardId: string, novoEstado: EstadoCard) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    if (novoEstado === "EM_ANDAMENTO" && !card.responsavel) {
      setErro("Atribua um responsável ao card antes de movê-lo para Em andamento.");
      return;
    }
    await atualizarCard(cardId, { estado: novoEstado, usuarioAtualId });
  }

  async function onAtribuirResponsavel(cardId: string, responsavel: string) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    await atualizarCard(cardId, { estado: card.estado, responsavel, usuarioAtualId });
  }

  async function atualizarCard(cardId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.erro ?? "Não foi possível atualizar o card.");
      return;
    }
    setErro(null);
    setCards((atual) => atual.map((c) => (c.id === cardId ? data : c)));
  }

  async function gerarComparativoComIa() {
    if (!ciclo) return;
    setGerandoComparativo(true);
    setErroModal(null);
    try {
      const res = await fetch(`/api/ciclos/${ciclo.id}/gerar-comparativo`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setComparativoAntes(data.comparativoAntes);
      setComparativoDepois(data.comparativoDepois);
    } catch (error) {
      setErroModal(error instanceof Error ? error.message : "Não foi possível gerar o comparativo com IA.");
    } finally {
      setGerandoComparativo(false);
    }
  }

  async function confirmarConclusao() {
    if (!ciclo) return;
    if (!comparativoAntes.trim() || !comparativoDepois.trim()) {
      setErroModal("Descreva o estado anterior e as mudanças realizadas.");
      return;
    }
    setConcluindo(true);
    const res = await fetch(`/api/ciclos/${ciclo.id}/concluir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comparativoAntes, comparativoDepois, usuarioAtualId }),
    });
    const data = await res.json();
    setConcluindo(false);
    if (!res.ok) {
      setErroModal(data.erro ?? "Não foi possível concluir o ciclo.");
      return;
    }
    router.push("/carta-de-servicos");
  }

  if (!servico || !ciclo) {
    return <p className="text-sm text-slate-400">Carregando materialização...</p>;
  }

  const totalCards = cards.length;
  const cardsConcluidos = cards.filter((c) => c.estado === "CONCLUIDO").length;
  const percentual = totalCards === 0 ? 0 : Math.round((cardsConcluidos / totalCards) * 100);
  const responsaveis = Array.from(new Set([ciclo.responsavelAnalise, ...cards.map((c) => c.responsavel).filter(Boolean)])) as string[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Materialização das Melhorias</h1>
          <p className="text-sm text-slate-500">
            {servico.nome} · v{ciclo.versao} · Responsáveis: {responsaveis.join(", ") || "—"}
          </p>
          <p className="text-xs text-slate-400">Início: {new Date(ciclo.dataInicio).toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing percentual={percentual} />
          {percentual === 100 && (
            <button onClick={() => setModalAberto(true)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Concluir ciclo
            </button>
          )}
        </div>
      </div>

      {erro && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{erro}</p>}

      <KanbanBoard cards={cards} onMoverCard={onMoverCard} onAtribuirResponsavel={onAtribuirResponsavel} />

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
          <span>Progresso do ciclo</span>
          <span>
            {cardsConcluidos}/{totalCards} ({percentual}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percentual}%` }} />
        </div>
      </div>

      <Modal aberto={modalAberto} titulo="Concluir ciclo" onFechar={() => setModalAberto(false)}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-500">Descreva o comparativo antes/depois para arquivar este ciclo.</p>
            <button
              onClick={gerarComparativoComIa}
              disabled={gerandoComparativo}
              className="shrink-0 rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
            >
              {gerandoComparativo ? "Gerando..." : "Gerar com IA"}
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Antes</label>
            <textarea value={comparativoAntes} onChange={(e) => setComparativoAntes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Depois</label>
            <textarea value={comparativoDepois} onChange={(e) => setComparativoDepois(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </div>
          {erroModal && <p className="text-xs text-red-600">{erroModal}</p>}
          <button
            onClick={confirmarConclusao}
            disabled={concluindo}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {concluindo ? "Concluindo..." : "Confirmar conclusão"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
