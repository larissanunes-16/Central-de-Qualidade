import { ImportacaoForm } from "@/components/ImportacaoForm";

export default function ImportarServicoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Importação de serviço</h1>
        <p className="text-sm text-slate-500">
          Faça o upload dos documentos do serviço (blueprint, jornada, roteiro de entrevistas) e preencha os metadados antes da análise.
        </p>
      </div>
      <ImportacaoForm origem="IMPORTADO" />
    </div>
  );
}
