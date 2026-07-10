"use client";

import { useEffect, useState } from "react";
import type { Secretaria } from "@/types";

export default function ConfiguracoesPage() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);

  useEffect(() => {
    fetch("/api/secretarias").then((res) => res.json()).then(setSecretarias);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-sm text-slate-500">Configurações da conta e do sistema.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700">Sobre o sistema</p>
        <p className="mt-1 text-sm text-slate-500">
          Central de Qualidade — SECTI, Prefeitura do Recife. MVP standalone (Fase 1): autenticação própria, sem
          integração com sistemas institucionais. Fase 2 trará login institucional e acesso multi-secretaria.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Secretarias cadastradas</p>
        <ul className="flex flex-col gap-1">
          {secretarias.map((s) => (
            <li key={s.id} className="text-sm text-slate-600">
              {s.nome}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
