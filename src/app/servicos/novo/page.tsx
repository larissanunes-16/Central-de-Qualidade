import Link from "next/link";

export default function NovoServicoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Novo serviço</h1>
        <p className="text-sm text-slate-500">Este serviço já existe ou está sendo criado?</p>
      </div>

      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <Link
          href="/servicos/importar"
          className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-400 hover:shadow-md"
        >
          <p className="text-lg font-semibold text-slate-800">Este serviço já existe</p>
          <p className="text-sm text-slate-500">
            Importe documentos reais (blueprint, jornada, roteiro de entrevistas) para a IA diagnosticar falhas a partir de evidências.
          </p>
        </Link>

        <Link
          href="/servicos/planejamento/novo"
          className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 hover:border-violet-400 hover:shadow-md"
        >
          <p className="text-lg font-semibold text-slate-800">Este serviço está sendo criado</p>
          <p className="text-sm text-slate-500">
            Descreva o serviço planejado (objetivo, público, jornada, canais) para a IA gerar uma análise preditiva de risco antes do lançamento.
          </p>
        </Link>
      </div>
    </div>
  );
}
