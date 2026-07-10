"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Usuario } from "@/types";

type UsuarioAtualContextValue = {
  usuarios: Usuario[];
  usuarioAtual: Usuario | null;
  usuarioAtualId: string | null;
  selecionarUsuario: (id: string) => void;
};

const UsuarioAtualContext = createContext<UsuarioAtualContextValue | null>(null);

const CHAVE_LOCAL_STORAGE = "central-qualidade:usuario-atual-id";

export function UsuarioAtualProvider({ children }: { children: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioAtualId, setUsuarioAtualId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data: Usuario[]) => {
        setUsuarios(data);
        const salvo = typeof window !== "undefined" ? window.localStorage.getItem(CHAVE_LOCAL_STORAGE) : null;
        const existeSalvo = salvo && data.some((u) => u.id === salvo);
        setUsuarioAtualId(existeSalvo ? salvo : data[0]?.id ?? null);
      });
  }, []);

  function selecionarUsuario(id: string) {
    setUsuarioAtualId(id);
    window.localStorage.setItem(CHAVE_LOCAL_STORAGE, id);
  }

  const usuarioAtual = usuarios.find((u) => u.id === usuarioAtualId) ?? null;

  return (
    <UsuarioAtualContext.Provider value={{ usuarios, usuarioAtual, usuarioAtualId, selecionarUsuario }}>
      {children}
    </UsuarioAtualContext.Provider>
  );
}

export function useUsuarioAtual() {
  const context = useContext(UsuarioAtualContext);
  if (!context) throw new Error("useUsuarioAtual deve ser usado dentro de UsuarioAtualProvider.");
  return context;
}
