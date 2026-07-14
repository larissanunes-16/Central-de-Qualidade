import { MANIFESTACOES_RECENTES } from "@/lib/ouvidoria/mock";

export function TabelaManifestacoesRecentes() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Manifestações recentes</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="w-28 px-4 py-3">Data entrada</th>
            <th className="w-44 px-4 py-3">Manifestação</th>
            <th className="px-4 py-3">Resumo da manifestação</th>
          </tr>
        </thead>
        <tbody>
          {MANIFESTACOES_RECENTES.map((item) => (
            <tr key={item.protocolo} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2.5 text-slate-500">{item.dataEntrada}</td>
              <td className="px-4 py-2.5 font-medium text-slate-700">{item.protocolo}</td>
              <td className="px-4 py-2.5 text-slate-600">{item.resumo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
