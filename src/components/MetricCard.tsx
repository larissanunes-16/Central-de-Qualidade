export function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
