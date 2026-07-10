import { ImportacaoForm } from "@/components/ImportacaoForm";

export default function EditarImportacaoPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Importação de serviço</h1>
        <p className="text-sm text-slate-500">Revise os metadados e os documentos antes de iniciar a análise por IA.</p>
      </div>
      <ImportacaoForm servicoId={params.id} origem="IMPORTADO" />
    </div>
  );
}
