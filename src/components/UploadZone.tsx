"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { EXTENSOES_ACEITAS, TAMANHO_MAXIMO_BYTES } from "@/lib/constants";

function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// RN-01/RN-02/RN-05: aceita múltiplos arquivos (PDF, DOCX, JPEG, PNG) até 20 MB cada.
export function UploadZone({ arquivos, onChange }: { arquivos: File[]; onChange: (arquivos: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function adicionarArquivos(novos: FileList | null) {
    if (!novos) return;
    const validos: File[] = [];
    for (const arquivo of Array.from(novos)) {
      const extensao = "." + arquivo.name.split(".").pop()?.toLowerCase();
      if (!EXTENSOES_ACEITAS.includes(extensao)) {
        setErro(`Formato não aceito: ${arquivo.name}. Use PDF, DOCX, JPEG ou PNG.`);
        continue;
      }
      if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
        setErro(`O arquivo ${arquivo.name} excede o limite de 20 MB.`);
        continue;
      }
      validos.push(arquivo);
    }
    if (validos.length > 0) {
      setErro(null);
      onChange([...arquivos, ...validos]);
    }
  }

  function removerArquivo(index: number) {
    onChange(arquivos.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          adicionarArquivos(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          arrastando ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:bg-slate-50",
        )}
      >
        <p className="text-sm font-medium text-slate-600">Arraste os arquivos aqui ou clique para selecionar</p>
        <p className="text-xs text-slate-400">PDF, DOCX, JPEG ou PNG · máximo 20 MB por arquivo</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={EXTENSOES_ACEITAS.join(",")}
          onChange={(e) => adicionarArquivos(e.target.files)}
        />
      </div>

      {erro && <p className="text-xs text-red-600">{erro}</p>}

      {arquivos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {arquivos.map((arquivo, index) => (
            <li key={`${arquivo.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span className="truncate text-slate-700">{arquivo.name}</span>
              <span className="mx-2 shrink-0 text-xs text-slate-400">{formatarTamanho(arquivo.size)}</span>
              <button onClick={() => removerArquivo(index)} className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700">
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
