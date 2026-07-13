import { PlanejamentoForm } from "@/components/PlanejamentoForm";

export default function EditarPlanejamentoPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Planejamento do serviço</h1>
        <p className="text-sm text-slate-500">Revise a descrição antes de gerar a análise preditiva.</p>
      </div>
      <PlanejamentoForm servicoId={params.id} />
    </div>
  );
}
