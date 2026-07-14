"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useUsuarioAtual } from "./UsuarioAtualProvider";

type Metrics = { total: number; emAnalise: number; emMelhoria: number; concluidos: number };

function NavLink({ href, label, badge }: { href: string; label: string; badge?: number }) {
  const pathname = usePathname();
  const ativo = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        ativo ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700",
      )}
    >
      <span>{label}</span>
      {typeof badge === "number" && badge > 0 && (
        <span className={clsx("badge", ativo ? "bg-white/20 text-white" : "bg-brand-100 text-brand-700")}>{badge}</span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const { usuarios, usuarioAtual, usuarioAtualId, selecionarUsuario } = useUsuarioAtual();

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => res.json())
      .then(setMetrics);
  }, []);

  return (
    <aside className="flex h-screen w-64 flex-none flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8 px-2">
        <p className="text-lg font-bold text-brand-700">Central de Qualidade</p>
        <p className="text-xs text-slate-500">SECTI — Prefeitura do Recife</p>
      </div>

      <nav className="flex flex-1 flex-col gap-6">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Principal</p>
          <div className="flex flex-col gap-1">
            <NavLink href="/carta-de-servicos" label="Carta de serviços" />
            <NavLink href="/historico" label="Histórico" />
            <NavLink href="/ouvidoria/dashboard" label="Dashboard da Ouvidoria 4.0" />
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Ciclo atual</p>
          <div className="flex flex-col gap-1">
            <NavLink href="/servicos/importar" label="Importar serviço" />
            <NavLink href="/carta-de-servicos?estado=EM_ANALISE" label="Análises ativas" badge={metrics?.emAnalise} />
            <NavLink href="/carta-de-servicos?estado=EM_MELHORIA" label="Em melhoria" badge={metrics?.emMelhoria} />
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Conta</p>
          <div className="flex flex-col gap-1">
            <NavLink href="/equipe" label="Equipe" />
            <NavLink href="/configuracoes" label="Configurações" />
          </div>
        </div>
      </nav>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <label className="mb-1 block px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Usuário atual
        </label>
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm"
          value={usuarioAtualId ?? ""}
          onChange={(e) => selecionarUsuario(e.target.value)}
        >
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nome} ({usuario.papel === "GESTOR" ? "Gestor" : "Analista"})
            </option>
          ))}
        </select>
        {usuarioAtual && (
          <p className="mt-1 px-1 text-[11px] text-slate-400">
            Simulação de sessão — sem autenticação no MVP.
          </p>
        )}
      </div>
    </aside>
  );
}
