"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useCurrentActors, useCurrentDependencies, useCurrentEcosystem, useCurrentGovernanceRules } from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { KPIGrid } from "@/components/kpis/KPIGrid";
import { KPIExplainModal } from "@/components/kpis/KPIExplainModal";
import { TrendAnalytics } from "@/components/dashboard/TrendAnalytics";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import { calculateKPIs, concentrationShare } from "@/lib/kpiEngine";
import type { KPI, KPIDefinition } from "@/lib/types";

function ResilienceContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();

  const kpis = useMemo(
    () => calculateKPIs({ ecosystem, actors, dependencies, rules }, kpiDefinitions as KPIDefinition[]),
    [ecosystem, actors, dependencies, rules]
  );
  const resilienceKPIs = kpis.filter((k) => ["ra", "cri", "ccr", "dsc"].includes(k.id));
  const share = concentrationShare(actors, dependencies);
  const criticalUnstable = dependencies.filter((d) => (d.criticality === "Critical" || d.criticality === "High") && d.status !== "Active");
  const cyberRule = rules.find((r) => r.id === "G13");
  const redundancyRule = rules.find((r) => r.id === "G14");
  const [explainKpi, setExplainKpi] = useState<KPI | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blueLight">
              <ShieldCheck size={20} className="text-brand-blue" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Concentration Share (max actor)</p>
              <p className="text-2xl font-extrabold text-ink-900">{share.toFixed(0)}%</p>
            </div>
          </div>
          <div className="h-10 w-px bg-surface-border" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Cyber-Resilience Rule (G13)</p>
            <p className="text-sm font-bold text-ink-900">{cyberRule?.active ? `Active — ${cyberRule.compliance}% compliance` : "Inactive"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Capacity Redundancy Rule (G14)</p>
            <p className="text-sm font-bold text-ink-900">{redundancyRule?.active ? `Active — ${redundancyRule.compliance}% compliance` : "Inactive"}</p>
          </div>
          {criticalUnstable.length > 0 && (
            <div className="ml-auto flex items-center gap-2 rounded-lg bg-status-critical/10 px-3 py-2 text-[12px] font-medium text-status-critical">
              <AlertTriangle size={14} />
              {criticalUnstable.length} critical dependency(ies) unstable
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-400">Resilience Mechanisms</h2>
        <KPIGrid kpis={resilienceKPIs} onExplain={setExplainKpi} />
      </div>

      <TrendAnalytics
        kpis={resilienceKPIs}
        title="Resilience Trend Analytics"
        subtitle="Absorption, concentration, circularity and data sovereignty over time"
      />

      <KPIExplainModal
        kpi={explainKpi}
        allKpis={kpis}
        ctx={{ ecosystem, actors, dependencies, rules }}
        open={!!explainKpi}
        onClose={() => setExplainKpi(null)}
      />
    </div>
  );
}

export default function ResiliencePage() {
  return (
    <RequireEcosystem>
      <ResilienceContent />
    </RequireEcosystem>
  );
}
