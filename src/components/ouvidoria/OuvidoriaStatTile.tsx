import clsx from "clsx";

export function OuvidoriaStatTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "negativo" | "neutro" | "positivo";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={clsx(
          "mt-1 text-xl font-bold tabular-nums",
          tone === "neutral" && "text-slate-800",
          tone === "negativo" && "text-red-600",
          tone === "neutro" && "text-slate-500",
          tone === "positivo" && "text-emerald-600",
        )}
      >
        {value.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
