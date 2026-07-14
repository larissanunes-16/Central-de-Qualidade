import { FiltrosOuvidoria } from "@/components/ouvidoria/FiltrosOuvidoria";
import { GraficosMensais } from "@/components/ouvidoria/GraficosMensais";
import { GraficoNatureza } from "@/components/ouvidoria/GraficoNatureza";
import { GraficoSentimento } from "@/components/ouvidoria/GraficoSentimento";
import { GraficoSigilosa } from "@/components/ouvidoria/GraficoSigilosa";
import { OuvidoriaStatTile } from "@/components/ouvidoria/OuvidoriaStatTile";
import { TabelaOuvidoria } from "@/components/ouvidoria/TabelaOuvidoria";
import { TabelaManifestacoesRecentes } from "@/components/ouvidoria/TabelaManifestacoesRecentes";
import { KPIS_OUVIDORIA } from "@/lib/ouvidoria/mock";

export default function DashboardOuvidoriaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard da Ouvidoria 4.0</h1>
        <p className="text-sm text-slate-500">Sentimento das manifestações recebidas pela Ouvidoria.</p>
      </div>

      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Layout de exemplo — os números aqui são ilustrativos. Esta tela será conectada à base real da Ouvidoria 4.0 em seguida.
      </div>

      <FiltrosOuvidoria />

      <GraficosMensais />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <OuvidoriaStatTile label="Manifestações" value={KPIS_OUVIDORIA.manifestacoes} />
        <OuvidoriaStatTile label="Respondidas" value={KPIS_OUVIDORIA.respondidas} />
        <OuvidoriaStatTile label="Fora do prazo" value={KPIS_OUVIDORIA.foraDoPrazo} />
        <OuvidoriaStatTile label="Negativas" value={KPIS_OUVIDORIA.negativas} tone="negativo" />
        <OuvidoriaStatTile label="Neutras" value={KPIS_OUVIDORIA.neutras} tone="neutro" />
        <OuvidoriaStatTile label="Positivas" value={KPIS_OUVIDORIA.positivas} tone="positivo" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GraficoNatureza />
        <GraficoSentimento />
        <GraficoSigilosa />
      </div>

      <TabelaOuvidoria />

      <TabelaManifestacoesRecentes />
    </div>
  );
}
