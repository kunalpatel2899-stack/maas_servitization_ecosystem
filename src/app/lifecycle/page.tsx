"use client";

import { useAppStore, useCurrentActors, useCurrentDependencies, useCurrentEcosystem, useCurrentGovernanceRules } from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { LifecyclePanel } from "@/components/lifecycle/LifecyclePanel";
import { useLiveKPIs } from "@/hooks/useLiveKPIs";
import { Card, CardContent } from "@/components/ui/Card";
import { Gauge } from "lucide-react";
import type { LifecyclePhaseName } from "@/lib/types";

const gateStyles: Record<string, string> = {
  PASS: "text-status-healthy bg-status-healthy/10 border-status-healthy/30",
  HOLD: "text-status-warning bg-status-warning/10 border-status-warning/30",
  FAIL: "text-status-critical bg-status-critical/10 border-status-critical/30",
};

function LifecycleContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const updateEcosystem = useAppStore((s) => s.updateEcosystem);
  const { kpis, phaseGate } = useLiveKPIs(ecosystem, actors, dependencies, rules);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blueLight">
              <Gauge size={20} className="text-brand-blue" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Current Phase Gate</p>
              <p className="text-lg font-bold text-ink-900">{ecosystem.currentPhase}</p>
            </div>
          </div>
          <span className={`ml-auto inline-flex items-center rounded-lg border px-4 py-1.5 font-mono text-sm font-bold tracking-wider ${gateStyles[phaseGate]}`}>
            {phaseGate}
          </span>
        </CardContent>
      </Card>

      <LifecyclePanel
        ecosystem={ecosystem}
        actors={actors}
        dependencies={dependencies}
        rules={rules}
        kpis={kpis}
        onSelectPhase={(phase: LifecyclePhaseName) => updateEcosystem(ecosystem.id, { currentPhase: phase })}
      />
    </div>
  );
}

export default function LifecyclePage() {
  return (
    <RequireEcosystem>
      <LifecycleContent />
    </RequireEcosystem>
  );
}
