"use client";

import { useMemo, useState } from "react";
import { ScrollText, AlertOctagon } from "lucide-react";
import { useAppStore, useCurrentEcosystem, useCurrentGovernanceRules } from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { GovernanceRuleCard } from "@/components/governance/GovernanceRuleCard";
import { governanceVoidScore } from "@/lib/kpiEngine";

function GovernanceRulesContent() {
  const ecosystem = useCurrentEcosystem()!;
  const rules = useCurrentGovernanceRules();
  const updateGovernanceRule = useAppStore((s) => s.updateGovernanceRule);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const gvs = useMemo(() => governanceVoidScore(rules), [rules]);
  const inactiveCount = rules.filter((r) => !r.active).length;

  const categories = useMemo(() => Array.from(new Set(rules.map((r) => r.category))), [rules]);
  const filtered = categoryFilter === "all" ? rules : rules.filter((r) => r.category === categoryFilter);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blueLight">
              <ScrollText size={20} className="text-brand-blue" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Governance Void Score</p>
              <p className="text-2xl font-extrabold text-ink-900">{gvs.toFixed(1)}<span className="text-sm font-medium text-ink-400"> / 100</span></p>
            </div>
          </div>
          <div className="h-10 w-px bg-surface-border" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Active Rules</p>
            <p className="text-lg font-bold text-ink-900">{rules.length - inactiveCount} / {rules.length}</p>
          </div>
          {inactiveCount > 0 && (
            <div className="ml-auto flex items-center gap-2 rounded-lg bg-status-critical/10 px-3 py-2 text-[12px] font-medium text-status-critical">
              <AlertOctagon size={14} />
              {inactiveCount} rule(s) inactive — governance void is increasing
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Governance Rules — {ecosystem.name}</CardTitle>
            <CardSubtitle>Activate, deactivate and tune each rule. The Governance Void Score updates instantly.</CardSubtitle>
          </div>
          <Select className="max-w-[200px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((rule, i) => (
              <GovernanceRuleCard key={rule.id} rule={rule} index={i} onUpdate={(patch) => updateGovernanceRule(rule.id, patch)} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GovernanceRulesPage() {
  return (
    <RequireEcosystem>
      <GovernanceRulesContent />
    </RequireEcosystem>
  );
}
