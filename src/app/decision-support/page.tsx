"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Lightbulb, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import {
  useAppStore,
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { GovernanceRiskPanel } from "@/components/dashboard/GovernanceRiskPanel";
import { DecisionSupportPanel } from "@/components/dashboard/DecisionSupportPanel";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import { runAssessment } from "@/lib/assessmentEngine";
import { generateExecutiveNarrative } from "@/lib/narrativeEngine";
import type { KPIDefinition } from "@/lib/types";

function DecisionSupportContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const savedAssessment = useAppStore((s) => s.assessments[ecosystem.id] ?? null);

  const assessment = useMemo(
    () => savedAssessment ?? runAssessment(ecosystem, actors, dependencies, rules, kpiDefinitions as KPIDefinition[]),
    [savedAssessment, ecosystem, actors, dependencies, rules]
  );

  const narrative = useMemo(() => generateExecutiveNarrative(ecosystem, assessment), [ecosystem, assessment]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      {!savedAssessment && (
        <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-[12px] text-ink-700">
          Showing a live preview based on current ecosystem state.{" "}
          <Link href="/assessment" className="font-semibold text-brand-blue hover:underline">Run a Governance Assessment</Link>{" "}
          to save an official record for this analysis.
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText size={15} className="text-brand-blue" /> Executive Governance Summary
            </CardTitle>
            <CardSubtitle>AI Governance Consultant narrative — Step 8 of the ROGF methodology</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 rounded-lg border border-surface-border bg-surface-panelAlt/50 p-5">
            {narrative.paragraphs.map((p, i) => (
              <p key={i} className="text-[13.5px] leading-relaxed text-ink-700">{p}</p>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KeyStat icon={<TrendingUp size={16} className="text-brand-blue" />} label="ROGMA Score" value={assessment.rogma.toFixed(1)} />
            <KeyStat icon={<AlertTriangle size={16} className="text-status-warning" />} label="Governance Findings" value={`${assessment.governanceGaps.length + assessment.dependencyRisks.length}`} />
            <KeyStat icon={<Lightbulb size={16} className="text-brand-teal" />} label="Lifecycle Readiness" value={`${assessment.lifecycleReadiness}%`} />
          </div>
        </CardContent>
      </Card>

      <GovernanceRiskPanel risks={[...assessment.governanceGaps, ...assessment.dependencyRisks]} />

      <DecisionSupportPanel recommendations={assessment.recommendations} />
    </div>
  );
}

function KeyStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-white p-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-panelAlt">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
        <p className="text-lg font-extrabold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

export default function DecisionSupportPage() {
  return (
    <RequireEcosystem>
      <DecisionSupportContent />
    </RequireEcosystem>
  );
}
