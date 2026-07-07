"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gauge, Play, Clock, ArrowRight, Lock } from "lucide-react";
import {
  useAppStore,
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { KPIGrid } from "@/components/kpis/KPIGrid";
import { KPIExplainModal } from "@/components/kpis/KPIExplainModal";
import { GovernanceRiskPanel } from "@/components/dashboard/GovernanceRiskPanel";
import { DecisionSupportPanel } from "@/components/dashboard/DecisionSupportPanel";
import { ValidationPanel } from "@/components/assessment/ValidationPanel";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import { runAssessment } from "@/lib/assessmentEngine";
import { validateEcosystem } from "@/lib/validationEngine";
import type { AssessmentResult, KPI, KPIDefinition } from "@/lib/types";
import { toast } from "@/lib/toast";

const gateStyles: Record<string, string> = {
  PASS: "text-status-healthy bg-status-healthy/10 border-status-healthy/30",
  HOLD: "text-status-warning bg-status-warning/10 border-status-warning/30",
  FAIL: "text-status-critical bg-status-critical/10 border-status-critical/30",
};
const healthStyles: Record<string, string> = {
  Healthy: "text-status-healthy bg-status-healthy/10",
  "At Risk": "text-status-warning bg-status-warning/10",
  Critical: "text-status-critical bg-status-critical/10",
};

function AssessmentContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const saveAssessment = useAppStore((s) => s.saveAssessment);
  const savedAssessment = useAppStore((s) => s.assessments[ecosystem.id]);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(savedAssessment ?? null);
  const [explainKpi, setExplainKpi] = useState<KPI | null>(null);

  const validation = useMemo(() => validateEcosystem(ecosystem, actors, dependencies, rules), [ecosystem, actors, dependencies, rules]);
  const canRun = validation.status === "Assessment Ready";

  const handleRun = () => {
    if (!canRun) return;
    setRunning(true);
    setTimeout(() => {
      const assessment = runAssessment(ecosystem, actors, dependencies, rules, kpiDefinitions as KPIDefinition[]);
      saveAssessment(assessment);
      setResult(assessment);
      setRunning(false);
      toast.success(`Assessment complete — ROGMA ${assessment.rogma.toFixed(1)}, ${assessment.health}.`);
    }, 500); // brief delay to communicate a "computation pass" for the demo
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <Card>
        <CardContent className="py-4 text-[12.5px] leading-relaxed text-ink-600">
          <strong className="text-ink-900">Step 6 of the ROGF methodology.</strong> A Governance Assessment calculates every KPI, the
          ROGMA composite score, ecosystem health, lifecycle readiness, governance gaps and dependency risks in a single, reproducible
          pass — the validation gate below ensures there is enough structured data for the result to be scientifically meaningful.
        </CardContent>
      </Card>

      <ValidationPanel result={validation} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge size={15} className="text-brand-blue" /> ROGMA Governance Assessment — {ecosystem.name}
            </CardTitle>
            <CardSubtitle>
              Calculates every KPI, ROGMA, ecosystem health, lifecycle readiness, governance gaps, dependency risks and recommendations.
            </CardSubtitle>
          </div>
          <Button variant="primary" onClick={handleRun} disabled={running || !canRun} title={!canRun ? "Resolve the validation issues above first" : undefined}>
            {!canRun ? <Lock size={14} /> : <Play size={14} />} {running ? "Running…" : "Run Governance Assessment"}
          </Button>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-ink-500">
              <span className="flex items-center gap-1.5"><Clock size={13} /> Last run {new Date(result.timestamp).toLocaleString()}</span>
              <span className={`rounded-full px-2.5 py-0.5 font-semibold ${healthStyles[result.health]}`}>{result.health}</span>
              <span className={`inline-flex items-center rounded-lg border px-3 py-1 font-mono text-xs font-bold ${gateStyles[result.phaseGate]}`}>
                Phase Gate: {result.phaseGate}
              </span>
              <span>Lifecycle Readiness: <strong className="text-ink-900">{result.lifecycleReadiness}%</strong></span>
              <span>ROGMA: <strong className="text-ink-900">{result.rogma.toFixed(1)}</strong></span>
              <div className="ml-auto flex gap-3">
                <Link href="/rogma-analysis" className="flex items-center gap-1 font-medium text-brand-blue hover:underline">
                  ROGMA Analysis <ArrowRight size={13} />
                </Link>
                <Link href="/decision-support" className="flex items-center gap-1 font-medium text-brand-blue hover:underline">
                  Recommendations <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-ink-400">
              {canRun ? "No assessment has been run yet for this ecosystem." : "Resolve the validation issues above before running an assessment."}
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-400">Governance KPIs</h2>
            <KPIGrid kpis={result.kpis} onExplain={setExplainKpi} />
          </div>

          <GovernanceRiskPanel risks={[...result.governanceGaps, ...result.dependencyRisks]} />

          <DecisionSupportPanel recommendations={result.recommendations} />

          <KPIExplainModal
            kpi={explainKpi}
            allKpis={result.kpis}
            ctx={{ ecosystem, actors, dependencies, rules }}
            open={!!explainKpi}
            onClose={() => setExplainKpi(null)}
          />
        </>
      )}
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <RequireEcosystem>
      <AssessmentContent />
    </RequireEcosystem>
  );
}
