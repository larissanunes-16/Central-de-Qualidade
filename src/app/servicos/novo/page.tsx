import { ImportacaoForm } from "@/components/ImportacaoForm";

export default function NovoServicoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Criação de um novo serviço</h1>
        <p className="text-sm text-slate-500">
          Preencha as informações do serviço e do fluxo previsto. O relatório gerado sugere melhorias e um layout inicial com boas práticas de design.
        </p>
      </div>
      <ImportacaoForm origem="CRIADO_NOVO" />
    </div>
  );
}
