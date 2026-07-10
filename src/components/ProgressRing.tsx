export function ProgressRing({ percentual, tamanho = 72 }: { percentual: number; tamanho?: number }) {
  const raio = tamanho / 2 - 6;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - percentual / 100);

  return (
    <div className="relative" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="rotate-[-90deg]">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={raio} stroke="#e2e8f0" strokeWidth={6} fill="none" />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke="#3a6cf0"
          strokeWidth={6}
          fill="none"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-700">{percentual}%</span>
    </div>
  );
}
