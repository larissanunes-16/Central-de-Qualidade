import { PlanejamentoForm } from "@/components/PlanejamentoForm";

export default function NovoPlanejamentoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Criação de um novo serviço</h1>
        <p className="text-sm text-slate-500">Descreva o serviço planejado para a IA gerar uma análise de riscos previstos.</p>
      </div>
      <PlanejamentoForm />
    </div>
  );
}
