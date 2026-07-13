"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "./UploadZone";
import type { Documento, Secretaria, ServicoDetalhado } from "@/types";

type Props = {
  servicoId?: string;
};

type Erros = { nome?: string; secretariaId?: string; responsavelAnalise?: string; arquivos?: string };

export function ImportacaoForm({ servicoId }: Props) {
  const router = useRouter();
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [nome, setNome] = useState("");
  const [secretariaId, setSecretariaId] = useState("");
  const [responsavelAnalise, setResponsavelAnalise] = useState("");
  const [contextoAdicional, setContextoAdicional] = useState("");
  const [arquivosNovos, setArquivosNovos] = useState<File[]>([]);
  const [documentosExistentes, setDocumentosExistentes] = useState<Documento[]>([]);
  const [comentarios, setComentarios] = useState<{ id: string; texto: string }[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState<"rascunho" | "analise" | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [nomeDuplicado, setNomeDuplicado] = useState(false);

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
        setContextoAdicional(data.cicloAtual?.contextoAdicional ?? "");
        setDocumentosExistentes(data.cicloAtual?.documentos ?? []);
        setComentarios(data.comentariosOuvidoria);
      });
  }, [servicoId]);

  useEffect(() => {
    if (!nome.trim() || servicoId) return;
    const timeout = setTimeout(() => {
      fetch(`/api/servicos?estado=AGUARDANDO_ANALISE&estado=EM_ANALISE&estado=EM_MELHORIA&estado=CONCLUIDO`)
        .then((res) => res.json())
        .then((lista: { nome: string; secretaria: { id: string } }[]) => {
          setNomeDuplicado(lista.some((s) => s.nome.trim().toLowerCase() === nome.trim().toLowerCase() && s.secretaria.id === secretariaId));
        });
    }, 400);
    return () => clearTimeout(timeout);
  }, [nome, secretariaId, servicoId]);

  function validar(exigirArquivo: boolean): boolean {
    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do serviço.";
    if (!secretariaId) novosErros.secretariaId = "Selecione a secretaria responsável.";
    if (!responsavelAnalise.trim()) novosErros.responsavelAnalise = "Informe ao menos um responsável pela análise.";
    if (exigirArquivo && documentosExistentes.length + arquivosNovos.length === 0) {
      novosErros.arquivos = "Importe ao menos 1 documento antes de iniciar a análise.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function salvarRascunho() {
    if (!validar(false)) return;
    setEnviando("rascunho");
    setErroGeral(null);
    try {
      if (!servicoId) {
        const formData = montarFormData(false);
        const res = await fetch("/api/servicos", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
      } else {
        await salvarMetadadosExistente();
        if (arquivosNovos.length > 0) await enviarNovosDocumentos();
      }
      router.push("/carta-de-servicos");
    } catch (error) {
      setErroGeral(error instanceof Error ? error.message : "Não foi possível salvar o rascunho.");
    } finally {
      setEnviando(null);
    }
  }

  async function iniciarAnalise() {
    if (!validar(true)) return;
    setEnviando("analise");
    setErroGeral(null);
    try {
      let idServico = servicoId;
      if (!idServico) {
        const formData = montarFormData(true);
        const res = await fetch("/api/servicos", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
        idServico = data.id;
      } else {
        await salvarMetadadosExistente();
        if (arquivosNovos.length > 0) await enviarNovosDocumentos();
        const res = await fetch(`/api/servicos/${idServico}/iniciar-analise`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
      }
      router.push(`/servicos/${idServico}/analise`);
    } catch (error) {
      setErroGeral(error instanceof Error ? error.message : "Não foi possível iniciar a análise.");
    } finally {
      setEnviando(null);
    }
  }

  function montarFormData(iniciar: boolean) {
    const formData = new FormData();
    formData.append("nome", nome.trim());
    formData.append("secretariaId", secretariaId);
    formData.append("responsavelAnalise", responsavelAnalise.trim());
    formData.append("contextoAdicional", contextoAdicional.trim());
    formData.append("iniciarAnalise", String(iniciar));
    arquivosNovos.forEach((arquivo) => formData.append("arquivos", arquivo));
    return formData;
  }

  async function salvarMetadadosExistente() {
    await fetch(`/api/servicos/${servicoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim(), secretariaId, responsavelAnalise: responsavelAnalise.trim(), contextoAdicional: contextoAdicional.trim() }),
    });
  }

  async function enviarNovosDocumentos() {
    const formData = new FormData();
    arquivosNovos.forEach((arquivo) => formData.append("arquivos", arquivo));
    const res = await fetch(`/api/servicos/${servicoId}/documentos`, { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.erro);
    }
    setArquivosNovos([]);
  }

  async function removerDocumentoExistente(docId: string) {
    const res = await fetch(`/api/servicos/${servicoId}/documentos/${docId}`, { method: "DELETE" });
    if (res.ok) setDocumentosExistentes((atual) => atual.filter((d) => d.id !== docId));
  }

  async function adicionarComentario() {
    if (!novoComentario.trim() || !servicoId) return;
    const res = await fetch(`/api/servicos/${servicoId}/ouvidoria`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: novoComentario.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setComentarios((atual) => [data, ...atual]);
      setNovoComentario("");
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Nome do serviço *</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Ex.: Agendamento de Consultas"
        />
        {erros.nome && <p className="text-xs text-red-600">{erros.nome}</p>}
        {nomeDuplicado && !erros.nome && (
          <p className="text-xs text-amber-600">Já existe um serviço com este nome nesta secretaria. Você ainda pode continuar.</p>
        )}
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
        <label className="text-sm font-medium text-slate-700">Contexto adicional (opcional)</label>
        <textarea
          value={contextoAdicional}
          onChange={(e) => setContextoAdicional(e.target.value)}
          rows={3}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Informações que não estão nos documentos importados"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Documentos</label>
        {documentosExistentes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {documentosExistentes.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span className="truncate text-slate-700">{doc.nome}</span>
                <button onClick={() => removerDocumentoExistente(doc.id)} className="text-xs font-medium text-red-500 hover:text-red-700">
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
        <UploadZone arquivos={arquivosNovos} onChange={setArquivosNovos} />
        {erros.arquivos && <p className="text-xs text-red-600">{erros.arquivos}</p>}
      </div>

      {servicoId && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4">
          <label className="text-sm font-medium text-slate-700">Comentários da ouvidoria sobre este serviço</label>
          <p className="text-xs text-slate-400">Usados pela IA como insumo adicional na análise (RN-15).</p>
          <div className="flex gap-2">
            <input
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Ex.: Usuários reclamam da demora no atendimento presencial"
            />
            <button onClick={adicionarComentario} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
              Adicionar
            </button>
          </div>
          {comentarios.length > 0 && (
            <ul className="flex flex-col gap-1">
              {comentarios.map((c) => (
                <li key={c.id} className="rounded bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {c.texto}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
          onClick={iniciarAnalise}
          disabled={enviando !== null}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {enviando === "analise" ? "Iniciando..." : "Iniciar análise com IA"}
        </button>
      </div>
    </div>
  );
}
