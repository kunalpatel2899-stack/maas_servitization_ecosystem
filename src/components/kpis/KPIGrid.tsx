import type { KPI } from "@/lib/types";
import { KPICard } from "./KPICard";

export function KPIGrid({ kpis, onExplain }: { kpis: KPI[]; onExplain?: (kpi: KPI) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.id} kpi={kpi} index={i} onExplain={onExplain} />
      ))}
    </div>
  );
}
