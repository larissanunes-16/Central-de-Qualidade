export function ComparativoAntesDepois({ antes, depois }: { antes: string | null; depois: string | null }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl bg-red-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600">Antes</p>
        <p className="text-sm text-red-800">{antes || "Não informado."}</p>
      </div>
      <div className="rounded-xl bg-emerald-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">Depois</p>
        <p className="text-sm text-emerald-800">{depois || "Não informado."}</p>
      </div>
    </div>
  );
}
