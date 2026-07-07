// Computes phase-gate criteria dynamically from live state — no hardcoded
// pass/fail strings. Each criterion is a small predicate over the current
// ecosystem/actors/dependencies/rules/KPIs.

import type { Actor, Dependency, Ecosystem, GovernanceRule, KPI, LifecyclePhaseName } from "./types";

export interface Criterion {
  label: string;
  met: boolean;
}

export interface TransitionAnalysis {
  readiness: number;
  transitionProbability: number;
  blockingFactors: string[];
}

function kpiMet(kpis: KPI[], id: string): boolean {
  const k = kpis.find((x) => x.id === id);
  if (!k) return false;
  return k.lowerIsBetter ? k.current <= k.target : k.current >= k.target;
}

export function computeCriteria(
  phase: LifecyclePhaseName,
  ecosystem: Ecosystem,
  actors: Actor[],
  dependencies: Dependency[],
  rules: GovernanceRule[],
  kpis: KPI[]
): Criterion[] {
  const activeRules = rules.filter((r) => r.active).length;
  const uniqueRoles = new Set(actors.map((a) => a.role)).size;
  const avgCompliance = rules.length ? rules.reduce((s, r) => s + r.compliance, 0) / rules.length : 0;

  switch (phase) {
    case "Emergence":
      return [
        { label: `Founding actor coalition formed (≥3 actors)`, met: actors.length >= 3 },
        { label: `Core governance rules active (≥5 of ${rules.length})`, met: activeRules >= 5 },
        { label: `Initial dependency structure mapped (≥2 dependencies)`, met: dependencies.length >= 2 },
      ];
    case "Evolution":
      return [
        { label: `Actor base scaled (≥10 actors)`, met: actors.length >= 10 },
        { label: `Governance role diversity (≥8 distinct roles)`, met: uniqueRoles >= 8 },
        { label: `Governance Void Score within target`, met: kpiMet(kpis, "gvs") },
        { label: `Concentration Risk Index within target`, met: kpiMet(kpis, "cri") },
      ];
    case "Maturity":
      return [
        { label: `Resilience Absorption within target`, met: kpiMet(kpis, "ra") },
        { label: `Circular Closure Rate within target`, met: kpiMet(kpis, "ccr") },
        { label: `Data Sovereignty Compliance within target`, met: kpiMet(kpis, "dsc") },
      ];
    case "Transformation":
      return [
        { label: `Actor Learning Rate within target`, met: kpiMet(kpis, "alr") },
        { label: `Relational Capital within target`, met: kpiMet(kpis, "rc") },
        { label: `Ecosystem self-governance (all rules active, avg compliance ≥85%)`, met: activeRules === rules.length && avgCompliance >= 85 },
      ];
  }
}

export const REQUIRED_KPIS_BY_PHASE: Record<LifecyclePhaseName, string[]> = {
  Emergence: ["aor"],
  Evolution: ["gvs", "cri", "pcm"],
  Maturity: ["ra", "ccr", "dsc"],
  Transformation: ["alr", "rc"],
};

import { transitionReadiness } from "./kpiEngine";

/** Combines criteria completion with KPI-based readiness into a single
 *  transition probability, and lists the concrete blocking factors so
 *  users understand exactly why phase progression is or is not recommended. */
export function computeTransitionAnalysis(
  phase: LifecyclePhaseName,
  ecosystem: Ecosystem,
  actors: Actor[],
  dependencies: Dependency[],
  rules: GovernanceRule[],
  kpis: KPI[]
): TransitionAnalysis {
  const criteria = computeCriteria(phase, ecosystem, actors, dependencies, rules, kpis);
  const criteriaCompletionPct = criteria.length > 0 ? (criteria.filter((c) => c.met).length / criteria.length) * 100 : 100;
  const kpiReadiness = transitionReadiness(kpis, REQUIRED_KPIS_BY_PHASE[phase]);
  const transitionProbability = Math.round(criteriaCompletionPct * 0.4 + kpiReadiness * 0.6);

  const blockingFactors: string[] = criteria.filter((c) => !c.met).map((c) => c.label);
  for (const kpiId of REQUIRED_KPIS_BY_PHASE[phase]) {
    const k = kpis.find((x) => x.id === kpiId);
    if (!k) continue;
    const met = k.lowerIsBetter ? k.current <= k.target : k.current >= k.target;
    if (!met) {
      const gap = Math.abs(k.current - k.target);
      blockingFactors.push(`${k.name} is ${gap.toFixed(1)} ${k.unit === "%" ? "points" : "units"} away from its target (${k.current} vs. ${k.target}).`);
    }
  }

  return { readiness: kpiReadiness, transitionProbability: Math.max(0, Math.min(100, transitionProbability)), blockingFactors: [...new Set(blockingFactors)] };
}
