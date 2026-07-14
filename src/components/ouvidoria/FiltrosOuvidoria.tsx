const FILTROS_SELECT = [
  "Órgão da Ouvidoria",
  "Órgão",
  "Objeto (serviço ou programa)",
  "Ano",
  "Mês",
  "Sigiloso",
  "Natureza",
  "Sentimento",
];

// Filtros ainda decorativos — ficam funcionais quando a base real da Ouvidoria 4.0 chegar.
export function FiltrosOuvidoria() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {FILTROS_SELECT.map((label) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400">{label}</label>
            <select disabled className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-500">
              <option>Todos</option>
            </select>
          </div>
        ))}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-[11px] font-medium text-slate-400">Pesquisar por texto da manifestação</label>
          <input disabled className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500" placeholder="Digite para pesquisar..." />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-400">Pesquisar por protocolo</label>
          <input disabled className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500" placeholder="Protocolo" />
        </div>
      </div>
    </div>
  );
}
