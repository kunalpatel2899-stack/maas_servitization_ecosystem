"use client";

import { useMemo, useState } from "react";
import { Gauge, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  useAppStore,
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { KPIExplainModal } from "@/components/kpis/KPIExplainModal";
import { StatusDot } from "@/components/ui/StatusDot";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import { calculateKPIs, calculateROGMA } from "@/lib/kpiEngine";
import { explainKPI } from "@/lib/kpiExplain";
import type { KPI, KPIDefinition } from "@/lib/types";

function RogmaAnalysisContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const savedAssessment = useAppStore((s) => s.assessments[ecosystem.id] ?? null);
  const [explainKpiState, setExplainKpiState] = useState<KPI | null>(null);

  const liveKpis = useMemo(
    () => calculateKPIs({ ecosystem, actors, dependencies, rules }, kpiDefinitions as KPIDefinition[]),
    [ecosystem, actors, dependencies, rules]
  );

  const kpis = savedAssessment?.kpis ?? liveKpis;
  const rogma = savedAssessment?.rogma ?? calculateROGMA(kpis);
  const totalWeight = kpis.reduce((s, k) => s + k.weight, 0);

  const breakdown = kpis
    .map((k) => {
      const explanation = explainKPI(k, { ecosystem, actors, dependencies, rules }, kpis);
      const normalized = k.lowerIsBetter ? 100 - k.current : k.current;
      return { kpi: k, normalized, contributionPct: explanation.contributionPct };
    })
    .sort((a, b) => b.contributionPct - a.contributionPct);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      {!savedAssessment && (
        <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-[12px] text-ink-700">
          This is a <strong>live preview</strong> computed from the current ecosystem state — no official assessment snapshot has been
          saved yet.{" "}
          <Link href="/assessment" className="font-semibold text-brand-blue hover:underline">
            Run a Governance Assessment
          </Link>{" "}
          to save an official ROGMA record for reporting.
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge size={15} className="text-brand-blue" /> ROGMA Composite Breakdown
            </CardTitle>
            <CardSubtitle>Resilience-Oriented Governance Maturity Assessment — Step 7 of the ROGF methodology</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">ROGMA Score</p>
              <p className="text-4xl font-extrabold text-ink-900">{rogma.toFixed(1)}</p>
            </div>
            <div className="rounded-lg bg-surface-panelAlt px-4 py-3 font-mono text-[12px] text-ink-700">
              ROGMA = Σ (normalized(KPI) × weight) / Σ weight
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPI Contribution to ROGMA</CardTitle>
          <CardSubtitle>Ranked by contribution share · click a row to see the full scientific explanation</CardSubtitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface-panelAlt text-[11px] uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">KPI</th>
                  <th className="px-3.5 py-2.5 font-semibold">Current</th>
                  <th className="px-3.5 py-2.5 font-semibold">Normalized</th>
                  <th className="px-3.5 py-2.5 font-semibold">Weight</th>
                  <th className="px-3.5 py-2.5 font-semibold">Contribution</th>
                  <th className="px-3.5 py-2.5 font-semibold">Status</th>
                  <th className="px-3.5 py-2.5 font-semibold text-right">Explain</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map(({ kpi, normalized, contributionPct }) => (
                  <tr key={kpi.id} className="border-t border-surface-border hover:bg-surface-panelAlt/60">
                    <td className="px-3.5 py-2.5 font-medium text-ink-900">{kpi.name}</td>
                    <td className="px-3.5 py-2.5 font-mono text-ink-700">{kpi.current}{kpi.unit === "%" ? "%" : ""}</td>
                    <td className="px-3.5 py-2.5 font-mono text-ink-700">{Math.round(normalized * 10) / 10}</td>
                    <td className="px-3.5 py-2.5 font-mono text-ink-500">{kpi.weight} / {totalWeight.toFixed(1)}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-panelAlt">
                          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.min(100, contributionPct * 4)}%` }} />
                        </div>
                        <span className="font-mono text-ink-700">{contributionPct}%</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5"><StatusDot level={kpi.status} /></td>
                    <td className="px-3.5 py-2.5 text-right">
                      <button onClick={() => setExplainKpiState(kpi)} className="inline-flex items-center gap-1 text-brand-blue hover:underline">
                        <Info size={12} /> Explain
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <Link href="/decision-support" className="flex items-center gap-1.5 text-[13px] font-medium text-brand-blue hover:underline">
              Continue to Recommendations <ArrowRight size={14} />
            </Link>
          </div>
        </CardContent>
      </Card>

      <KPIExplainModal
        kpi={explainKpiState}
        allKpis={kpis}
        ctx={{ ecosystem, actors, dependencies, rules }}
        open={!!explainKpiState}
        onClose={() => setExplainKpiState(null)}
      />
    </div>
  );
}

export default function RogmaAnalysisPage() {
  return (
    <RequireEcosystem>
      <RogmaAnalysisContent />
    </RequireEcosystem>
  );
}
