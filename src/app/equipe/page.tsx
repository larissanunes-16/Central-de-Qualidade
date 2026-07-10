"use client";

import { useEffect, useState } from "react";
import type { Usuario } from "@/types";

export default function EquipePage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<"ANALISTA" | "GESTOR">("ANALISTA");
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    fetch("/api/usuarios").then((res) => res.json()).then(setUsuarios);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionarMembro() {
    setErro(null);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, papel }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.erro ?? "Não foi possível adicionar o membro.");
      return;
    }
    setNome("");
    setEmail("");
    setPapel("ANALISTA");
    carregar();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Equipe</h1>
        <p className="text-sm text-slate-500">Gerenciamento de membros da Central de Qualidade.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">E-mail (usuário de rede)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Papel</label>
          <select value={papel} onChange={(e) => setPapel(e.target.value as "ANALISTA" | "GESTOR")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="ANALISTA">Analista</option>
            <option value="GESTOR">Gestor</option>
          </select>
        </div>
        <button onClick={adicionarMembro} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Adicionar
        </button>
      </div>
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-700">{usuario.nome}</td>
                <td className="px-4 py-3 text-slate-500">{usuario.email}</td>
                <td className="px-4 py-3 text-slate-500">{usuario.papel === "GESTOR" ? "Gestor" : "Analista"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
