"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Link2 } from "lucide-react";
import type { GovernanceRisk } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge, Badge } from "@/components/ui/Badge";
import { severityRank } from "@/lib/utils";

export function GovernanceRiskPanel({ risks }: { risks: GovernanceRisk[] }) {
  const sorted = [...risks].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-status-warning" />
            Governance &amp; Dependency Risks
          </CardTitle>
          <CardSubtitle>Ranked by severity · every finding is traceable to a rule, actor, phase and KPI</CardSubtitle>
        </div>
        <Badge>{risks.length} active</Badge>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-400">No significant risks detected.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((risk, i) => (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-surface-borderLight bg-surface-panelAlt/60 p-3.5 hover:border-brand-blue/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-900">{risk.title}</span>
                    <SeverityBadge severity={risk.severity} />
                  </div>
                  <span className="text-[11px] text-ink-400">
                    Est. Impact: <span className="font-semibold text-ink-700">{risk.estimatedImpact}</span>
                  </span>
                </div>

                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{risk.description}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-ink-400">
                  <span>Responsible: <span className="font-medium text-ink-700">{risk.responsibleActor}</span></span>
                  {risk.affectedRules.length > 0 && (
                    <span className="flex items-center gap-1">
                      Rules: {risk.affectedRules.map((r) => <Badge key={r}>{r}</Badge>)}
                    </span>
                  )}
                </div>

                {/* Traceability strip — answers "why does this exist?" */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-dashed border-surface-borderLight pt-2 text-[10px] text-ink-400">
                  <Link2 size={11} className="text-brand-blue" />
                  <span className="font-semibold uppercase tracking-wide">Traceability:</span>
                  {risk.trace.governanceRuleId && <Badge>Rule {risk.trace.governanceRuleId}</Badge>}
                  {risk.trace.dependencyRuleId && <Badge>Dep. Rule {risk.trace.dependencyRuleId}</Badge>}
                  {risk.trace.actorName && <Badge>{risk.trace.actorName}</Badge>}
                  {risk.trace.lifecyclePhase && <Badge>{risk.trace.lifecyclePhase} Phase</Badge>}
                  {risk.trace.kpiId && <Badge>KPI: {risk.trace.kpiId.toUpperCase()}</Badge>}
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-brand-blueLight px-2.5 py-1.5 text-[12px] font-medium text-brand-blue">
                  <ArrowRight size={13} />
                  {risk.recommendedAction}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
