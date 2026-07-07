"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Network, ArrowRight } from "lucide-react";
import {
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { HeroGovernanceCard } from "@/components/dashboard/HeroGovernanceCard";
import { KPIGrid } from "@/components/kpis/KPIGrid";
import { KPIExplainModal } from "@/components/kpis/KPIExplainModal";
import { GovernanceRiskPanel } from "@/components/dashboard/GovernanceRiskPanel";
import { DecisionSupportPanel } from "@/components/dashboard/DecisionSupportPanel";
import { LifecyclePanel } from "@/components/lifecycle/LifecyclePanel";
import { DependencyGraph } from "@/components/dependencies/DependencyGraph";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import { calculateKPIs, calculateROGMA, calculateROGMAHistory, rogmaStatus, derivePhaseGate } from "@/lib/kpiEngine";
import { deriveGovernanceGaps, deriveDependencyRisks } from "@/lib/riskEngine";
import { generateRecommendations } from "@/lib/recommendationEngine";
import type { KPI, KPIDefinition } from "@/lib/types";

function DashboardContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const [explainKpi, setExplainKpi] = useState<KPI | null>(null);

  const { kpis, rogma, health, phaseGate, rogmaHistory, risks, recommendations } = useMemo(() => {
    const kpis = calculateKPIs({ ecosystem, actors, dependencies, rules }, kpiDefinitions as KPIDefinition[]);
    const rogma = calculateROGMA(kpis);
    const health = rogmaStatus(rogma);
    const phaseGate = derivePhaseGate(kpis);
    const rogmaHistory = calculateROGMAHistory(kpis);
    const risks = [...deriveGovernanceGaps(rules, kpis, ecosystem), ...deriveDependencyRisks(actors, dependencies, ecosystem)];
    const recommendations = generateRecommendations(kpis, risks, { actors, rules, ecosystem });
    return { kpis, rogma, health, phaseGate, rogmaHistory, risks, recommendations };
  }, [ecosystem, actors, dependencies, rules]);

  return (
    <div className="mx-auto max-w-[1800px] space-y-6 px-6 py-6">
      <HeroGovernanceCard
        rogma={rogma}
        health={health}
        phase={ecosystem.currentPhase}
        phaseGate={phaseGate}
        history={rogmaHistory}
        ecosystemName={ecosystem.name}
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-400">Governance KPI Monitor</h2>
        <KPIGrid kpis={kpis} onExplain={setExplainKpi} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GovernanceRiskPanel risks={risks} />
        <LifecyclePanel ecosystem={ecosystem} actors={actors} dependencies={dependencies} rules={rules} kpis={kpis} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network size={15} className="text-brand-blue" /> Ecosystem Network Preview
            </CardTitle>
            <CardSubtitle>{actors.length} actors · {dependencies.length} dependencies</CardSubtitle>
          </div>
          <Link href="/dependencies" className="flex items-center gap-1 text-[13px] font-medium text-brand-blue hover:underline">
            Open Dependency Mapping <ArrowRight size={13} />
          </Link>
        </CardHeader>
        <CardContent>
          <DependencyGraph actors={actors} dependencies={dependencies} height={420} />
        </CardContent>
      </Card>

      <DecisionSupportPanel recommendations={recommendations} />

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

export default function DashboardPage() {
  return (
    <RequireEcosystem>
      <DashboardContent />
    </RequireEcosystem>
  );
}
