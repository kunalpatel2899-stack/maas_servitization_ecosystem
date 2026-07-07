"use client";

import { useEffect, useMemo, useState } from "react";
import { GitCompareArrows } from "lucide-react";
import {
  useAppStore,
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { KPIGrid } from "@/components/kpis/KPIGrid";
import { KPIExplainModal } from "@/components/kpis/KPIExplainModal";
import { GovernanceRiskPanel } from "@/components/dashboard/GovernanceRiskPanel";
import { DecisionSupportPanel } from "@/components/dashboard/DecisionSupportPanel";
import { DependencyGraph } from "@/components/dependencies/DependencyGraph";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import { calculateKPIs, calculateROGMA, rogmaStatus, derivePhaseGate } from "@/lib/kpiEngine";
import { deriveGovernanceGaps, deriveDependencyRisks } from "@/lib/riskEngine";
import { generateRecommendations } from "@/lib/recommendationEngine";
import { applyScenario, DEFAULT_SIMULATION_INPUTS, isScenarioActive } from "@/lib/simulationEngine";
import type { KPI, KPIDefinition, SimulationInputs } from "@/lib/types";
import { toast } from "@/lib/toast";

const gateStyles: Record<string, string> = {
  PASS: "text-status-healthy bg-status-healthy/10 border-status-healthy/30",
  HOLD: "text-status-warning bg-status-warning/10 border-status-warning/30",
  FAIL: "text-status-critical bg-status-critical/10 border-status-critical/30",
};

function SimulationContent() {
  const ecosystem = useCurrentEcosystem()!;
  const baseActors = useCurrentActors();
  const baseDependencies = useCurrentDependencies();
  const baseRules = useCurrentGovernanceRules();

  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_SIMULATION_INPUTS);
  const [explainKpi, setExplainKpi] = useState<KPI | null>(null);
  const active = isScenarioActive(inputs);
  const markSimulationRun = useAppStore((s) => s.markSimulationRun);

  useEffect(() => {
    if (active) {
      markSimulationRun(ecosystem.id);
      toast.info("Simulation scenario applied — KPIs and risks below now reflect the simulated state.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ecosystem.id, markSimulationRun]);

  const scenario = useMemo(() => applyScenario(baseActors, baseDependencies, baseRules, inputs), [baseActors, baseDependencies, baseRules, inputs]);

  const baseline = useMemo(() => {
    const kpis = calculateKPIs({ ecosystem, actors: baseActors, dependencies: baseDependencies, rules: baseRules }, kpiDefinitions as KPIDefinition[]);
    return { kpis, rogma: calculateROGMA(kpis) };
  }, [ecosystem, baseActors, baseDependencies, baseRules]);

  const { kpis, rogma, health, phaseGate, risks, recommendations } = useMemo(() => {
    const kpis = calculateKPIs({ ecosystem, actors: scenario.actors, dependencies: scenario.dependencies, rules: scenario.rules }, kpiDefinitions as KPIDefinition[]);
    const rogma = calculateROGMA(kpis);
    const health = rogmaStatus(rogma);
    const phaseGate = derivePhaseGate(kpis);
    const risks = [...deriveGovernanceGaps(scenario.rules, kpis, ecosystem), ...deriveDependencyRisks(scenario.actors, scenario.dependencies, ecosystem)];
    const recommendations = generateRecommendations(kpis, risks, { actors: scenario.actors, rules: scenario.rules, ecosystem });
    return { kpis, rogma, health, phaseGate, risks, recommendations };
  }, [ecosystem, scenario]);

  const rogmaDelta = Math.round((rogma - baseline.rogma) * 10) / 10;

  return (
    <div className="mx-auto max-w-[1800px] space-y-6 px-6 py-6">
      <SimulationPanel actors={baseActors} inputs={inputs} onChange={setInputs} />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 py-5">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={18} className="text-brand-blue" />
            <span className="text-[13px] font-semibold text-ink-700">{active ? "Simulated Scenario Active" : "Baseline (no scenario applied)"}</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">ROGMA</p>
            <p className="text-xl font-extrabold text-ink-900">
              {rogma.toFixed(1)}
              {active && (
                <span className={`ml-2 text-sm font-semibold ${rogmaDelta < 0 ? "text-status-critical" : "text-status-healthy"}`}>
                  ({rogmaDelta >= 0 ? "+" : ""}{rogmaDelta} vs baseline {baseline.rogma.toFixed(1)})
                </span>
              )}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${health === "Healthy" ? "text-status-healthy bg-status-healthy/10" : health === "At Risk" ? "text-status-warning bg-status-warning/10" : "text-status-critical bg-status-critical/10"}`}>
            {health}
          </span>
          <span className={`ml-auto inline-flex items-center rounded-lg border px-3 py-1 font-mono text-xs font-bold ${gateStyles[phaseGate]}`}>
            Phase Gate: {phaseGate}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ecosystem Network (Simulated)</CardTitle>
            <CardSubtitle>Node/edge risk colors reflect the scenario applied above</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <DependencyGraph actors={scenario.actors} dependencies={scenario.dependencies} height={480} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-400">Governance KPIs (Simulated)</h2>
        <KPIGrid kpis={kpis} onExplain={setExplainKpi} />
      </div>

      <GovernanceRiskPanel risks={risks} />
      <DecisionSupportPanel recommendations={recommendations} />

      <KPIExplainModal
        kpi={explainKpi}
        allKpis={kpis}
        ctx={{ ecosystem, actors: scenario.actors, dependencies: scenario.dependencies, rules: scenario.rules }}
        open={!!explainKpi}
        onClose={() => setExplainKpi(null)}
      />
    </div>
  );
}

export default function SimulationPage() {
  return (
    <RequireEcosystem>
      <SimulationContent />
    </RequireEcosystem>
  );
}
