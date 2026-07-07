"use client";

import { motion } from "framer-motion";
import { Lightbulb, CheckSquare, Link2, Gauge, Info } from "lucide-react";
import type { Recommendation } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge, Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

const priorityStyles: Record<string, string> = {
  Urgent: "text-status-critical bg-status-critical/10",
  High: "text-orange-600 bg-orange-500/10",
  Medium: "text-status-warning bg-status-warning/10",
  Low: "text-status-healthy bg-status-healthy/10",
};

export function DecisionSupportPanel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb size={15} className="text-brand-blue" />
            AI Decision Support
          </CardTitle>
          <CardSubtitle>Recommendations generated from live signal deviations — each one traceable to its source</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-400">No recommendations — the ecosystem is within healthy thresholds.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col rounded-lg border border-surface-borderLight bg-gradient-to-b from-surface-panelAlt to-white p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <SeverityBadge severity={rec.severity} />
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[rec.priority]}`}>{rec.priority} Priority</span>
                </div>
                <p className="mb-3 text-[13px] font-medium leading-snug text-ink-800">{rec.trigger}</p>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Recommended Actions</p>
                <ul className="space-y-1.5">
                  {rec.actions.map((a) => (
                    <li key={a} className="flex items-start gap-1.5 text-[12px] text-ink-700">
                      <CheckSquare size={13} className="mt-0.5 shrink-0 text-brand-blue" />
                      {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-surface-border pt-2.5 text-[10px]">
                  <div>
                    <p className="flex items-center gap-1 text-ink-400">
                      Impact
                      <Tooltip text="Expected effect on ecosystem governance health if this action is taken.">
                        <Info size={9} className="text-ink-300" />
                      </Tooltip>
                    </p>
                    <p className="font-semibold text-ink-800">{rec.estimatedImpact}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-ink-400">
                      Difficulty
                      <Tooltip text="Rough estimate of the organizational/technical effort required to implement this action.">
                        <Info size={9} className="text-ink-300" />
                      </Tooltip>
                    </p>
                    <p className="font-semibold text-ink-800">{rec.implementationDifficulty}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-brand-blue">
                    <Gauge size={11} />
                    <span className="font-semibold">~{Math.abs(rec.estimatedGovernanceImprovement)} ROGMA pts potential improvement</span>
                    <Tooltip text="Proportional to this KPI's current distance from its target — an estimate, not a guarantee.">
                      <Info size={10} className="text-brand-blue/60" />
                    </Tooltip>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-dashed border-surface-borderLight pt-2 text-[10px] text-ink-400">
                  <Link2 size={10} className="text-brand-blue" />
                  {rec.trace.governanceRuleId && <Badge>Rule {rec.trace.governanceRuleId}</Badge>}
                  {rec.trace.dependencyRuleId && <Badge>Dep. {rec.trace.dependencyRuleId}</Badge>}
                  {rec.trace.actorName && <Badge>{rec.trace.actorName}</Badge>}
                  {rec.trace.lifecyclePhase && <Badge>{rec.trace.lifecyclePhase}</Badge>}
                  {(rec.relatedKPI ?? rec.trace.kpiId) && <Badge>KPI: {(rec.relatedKPI ?? rec.trace.kpiId)?.toUpperCase()}</Badge>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
