"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, GitBranch, TrendingUp, Ban } from "lucide-react";
import type { Actor, Dependency, Ecosystem, GovernanceRule, KPI, LifecyclePhaseName } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";
import { computeCriteria, computeTransitionAnalysis, REQUIRED_KPIS_BY_PHASE } from "@/lib/lifecycleCriteria";

const ORDER: LifecyclePhaseName[] = ["Emergence", "Evolution", "Maturity", "Transformation"];

export function LifecyclePanel({
  ecosystem,
  actors,
  dependencies,
  rules,
  kpis,
  onSelectPhase,
}: {
  ecosystem: Ecosystem;
  actors: Actor[];
  dependencies: Dependency[];
  rules: GovernanceRule[];
  kpis: KPI[];
  onSelectPhase?: (phase: LifecyclePhaseName) => void;
}) {
  const currentIdx = ORDER.indexOf(ecosystem.currentPhase);
  const criteria = computeCriteria(ecosystem.currentPhase, ecosystem, actors, dependencies, rules, kpis);
  const completed = criteria.filter((c) => c.met);
  const remaining = criteria.filter((c) => !c.met);
  const analysis = computeTransitionAnalysis(ecosystem.currentPhase, ecosystem, actors, dependencies, rules, kpis);
  const readiness = analysis.readiness;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <GitBranch size={15} className="text-brand-blue" />
            Ecosystem Lifecycle
          </CardTitle>
          <CardSubtitle>Phase progression &amp; transition readiness — computed live from KPIs</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center">
          {ORDER.map((phase, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={phase} className="flex flex-1 items-center last:flex-none">
                <button onClick={() => onSelectPhase?.(phase)} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                      done && "border-brand-blue bg-brand-blueLight text-brand-blue",
                      active && "border-brand-blue bg-brand-blue text-white shadow-glow",
                      !done && !active && "border-surface-borderLight text-ink-400"
                    )}
                  >
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className={cn("text-[11px] font-medium", active ? "text-brand-blue" : done ? "text-ink-700" : "text-ink-400")}>
                    {phase}
                  </span>
                </button>
                {i < ORDER.length - 1 && (
                  <div className={cn("mx-2 h-0.5 flex-1 rounded-full", i < currentIdx ? "bg-brand-blue" : "bg-surface-borderLight")} />
                )}
              </div>
            );
          })}
        </div>

        <motion.div
          key={ecosystem.currentPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-surface-border bg-surface-panelAlt/60 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-900">{ecosystem.currentPhase} Phase — Transition Readiness</span>
            <span className="font-mono text-lg font-bold text-brand-blue">{readiness}%</span>
          </div>
          <Progress value={readiness} status={readiness >= 70 ? "healthy" : readiness >= 40 ? "warning" : "critical"} className="h-2" />

          <div className="mt-3 flex items-center gap-2 rounded-md bg-white px-3 py-2">
            <TrendingUp size={14} className="text-brand-blue" />
            <span className="text-[12px] text-ink-600">
              Transition Probability to next phase:{" "}
              <strong className="text-ink-900">{analysis.transitionProbability}%</strong>
              {" "}(blends criteria completion with KPI-based readiness)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Completed Criteria</p>
              <ul className="space-y-1.5">
                {completed.map((c) => (
                  <li key={c.label} className="flex items-start gap-1.5 text-[12px] text-ink-700">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-status-healthy" />
                    {c.label}
                  </li>
                ))}
                {completed.length === 0 && <li className="text-[12px] text-ink-400">None yet</li>}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Remaining Criteria</p>
              <ul className="space-y-1.5">
                {remaining.map((c) => (
                  <li key={c.label} className="flex items-start gap-1.5 text-[12px] text-ink-700">
                    <Circle size={13} className="mt-0.5 shrink-0 text-ink-300" />
                    {c.label}
                  </li>
                ))}
                {remaining.length === 0 && <li className="text-[12px] text-ink-400">All criteria met</li>}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Required KPIs:</span>
            {REQUIRED_KPIS_BY_PHASE[ecosystem.currentPhase].map((k) => (
              <span key={k} className="rounded-md border border-surface-borderLight bg-white px-2 py-0.5 text-[11px] text-ink-700">{k.toUpperCase()}</span>
            ))}
          </div>

          {analysis.blockingFactors.length > 0 && (
            <div className="mt-4 rounded-md border border-status-critical/25 bg-status-critical/[0.03] p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-status-critical">
                <Ban size={12} /> Blocking Factors
              </p>
              <ul className="space-y-1">
                {analysis.blockingFactors.map((b, i) => (
                  <li key={i} className="text-[12px] text-ink-600">• {b}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
