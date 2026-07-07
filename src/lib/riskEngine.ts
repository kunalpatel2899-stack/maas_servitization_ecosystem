// Derives governance gaps and dependency risks directly from live state.
// Used by the ROGMA Assessment module ("Highlight governance gaps",
// "Highlight dependency risks") and surfaced on the Dashboard. Every risk
// carries a `trace` block so the UI never shows an unexplained finding —
// each one points back to the concrete actor/rule/phase/KPI that produced it.

import type { Actor, Dependency, Ecosystem, GovernanceRisk, GovernanceRule, KPI, Traceability } from "./types";
import { concentrationShare } from "./kpiEngine";

let counter = 0;
function riskId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function deriveGovernanceGaps(rules: GovernanceRule[], kpis: KPI[], ecosystem: Ecosystem): GovernanceRisk[] {
  const risks: GovernanceRisk[] = [];
  const phase = ecosystem.currentPhase;

  const inactiveRules = rules.filter((r) => !r.active);
  if (inactiveRules.length > 0) {
    const worst = [...inactiveRules].sort((a, b) => (b.impact === "Critical" ? 1 : 0) - (a.impact === "Critical" ? 1 : 0))[0];
    const trace: Traceability = { governanceRuleId: worst.id, lifecyclePhase: phase, kpiId: "gvs" };
    risks.push({
      id: riskId("gap"),
      title: "Inactive Governance Rules",
      severity: inactiveRules.some((r) => r.impact === "Critical") ? "Critical" : inactiveRules.length > 3 ? "High" : "Medium",
      responsibleActor: worst.owner,
      affectedRules: inactiveRules.map((r) => r.id),
      recommendedAction: `Reactivate ${inactiveRules.map((r) => r.id).join(", ")} and assign accountable owners.`,
      estimatedImpact: inactiveRules.some((r) => r.impact === "Critical") ? "Critical" : "High",
      description: `${inactiveRules.length} governance rule(s) are currently inactive, creating an accountability gap in the ecosystem.`,
      category: "Governance Gap",
      trace,
    });
  }

  const lowComplianceRules = rules.filter((r) => r.active && r.compliance < 55);
  if (lowComplianceRules.length > 0) {
    risks.push({
      id: riskId("gap"),
      title: "Low Rule Compliance",
      severity: "High",
      responsibleActor: lowComplianceRules[0].owner,
      affectedRules: lowComplianceRules.map((r) => r.id),
      recommendedAction: "Schedule a governance audit and remediation plan for low-compliance rules.",
      estimatedImpact: "High",
      description: `${lowComplianceRules.length} active rule(s) show compliance below 55%.`,
      category: "Compliance Risk",
      trace: { governanceRuleId: lowComplianceRules[0].id, lifecyclePhase: phase, kpiId: "gvs" },
    });
  }

  const gvsKPI = kpis.find((k) => k.id === "gvs");
  if (gvsKPI && gvsKPI.status !== "healthy") {
    const g4 = rules.find((r) => r.id === "G4");
    risks.push({
      id: riskId("gap"),
      title: "Governance Void",
      severity: gvsKPI.status === "critical" ? "Critical" : "High",
      responsibleActor: g4?.owner ?? "Platform Operator",
      affectedRules: ["G4"],
      recommendedAction: "Activate Governance Rule G4 and ensure every governance role has an assigned actor.",
      estimatedImpact: gvsKPI.status === "critical" ? "Critical" : "High",
      description: `Governance Void Score is at ${gvsKPI.current}, above the healthy threshold of ${gvsKPI.target}.`,
      category: "Governance Gap",
      trace: { governanceRuleId: "G4", lifecyclePhase: phase, kpiId: "gvs" },
    });
  }

  return risks;
}

export function deriveDependencyRisks(actors: Actor[], dependencies: Dependency[], ecosystem: Ecosystem): GovernanceRisk[] {
  const risks: GovernanceRisk[] = [];
  if (actors.length === 0 || dependencies.length === 0) return risks;
  const phase = ecosystem.currentPhase;

  // Single point of failure: actor with disproportionate share of total dependency strength.
  const totals = new Map<string, number>();
  for (const d of dependencies) {
    totals.set(d.toActorId, (totals.get(d.toActorId) ?? 0) + d.strength);
  }
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const share = concentrationShare(actors, dependencies);
  if (sorted.length > 0 && share > 45) {
    const actor = actors.find((a) => a.id === sorted[0][0]);
    if (actor) {
      risks.push({
        id: riskId("dep"),
        title: "Single Point of Failure",
        severity: share > 65 ? "Critical" : "High",
        responsibleActor: actor.name,
        affectedRules: ["D12"],
        recommendedAction: `Qualify at least one alternate actor to reduce dependency concentration on ${actor.name}.`,
        estimatedImpact: share > 65 ? "Critical" : "High",
        description: `${actor.name} accounts for ${share.toFixed(0)}% of total dependency strength in the ecosystem.`,
        category: "Concentration Risk",
        trace: { actorId: actor.id, actorName: actor.name, dependencyRuleId: "D12", lifecyclePhase: phase, kpiId: "cri" },
      });
    }
  }

  const brokenOrAtRisk = dependencies.filter((d) => d.status !== "Active");
  if (brokenOrAtRisk.length > 0) {
    const critical = brokenOrAtRisk.filter((d) => d.criticality === "Critical" || d.criticality === "High");
    const firstRuleId = brokenOrAtRisk.find((d) => d.ruleId)?.ruleId ?? undefined;
    risks.push({
      id: riskId("dep"),
      title: "Unstable Dependencies",
      severity: critical.length > 0 ? "High" : "Medium",
      responsibleActor: "Platform Operator",
      affectedRules: [...new Set(brokenOrAtRisk.map((d) => d.ruleId).filter(Boolean))] as string[],
      recommendedAction: "Review and stabilize dependencies flagged At Risk or Broken.",
      estimatedImpact: critical.length > 0 ? "High" : "Medium",
      description: `${brokenOrAtRisk.length} dependency link(s) are currently At Risk or Broken.`,
      category: "Dependency Risk",
      trace: { dependencyRuleId: firstRuleId, lifecyclePhase: phase, kpiId: "ra" },
    });
  }

  // Exited/inactive actors still holding active dependencies.
  const inactiveActorIds = new Set(actors.filter((a) => a.status === "Exited" || a.status === "Inactive").map((a) => a.id));
  const orphanDeps = dependencies.filter((d) => inactiveActorIds.has(d.fromActorId) || inactiveActorIds.has(d.toActorId));
  if (orphanDeps.length > 0) {
    const affectedActor = actors.find((a) => inactiveActorIds.has(a.id));
    risks.push({
      id: riskId("dep"),
      title: "Dependencies on Inactive Actors",
      severity: "High",
      responsibleActor: "Platform Operator",
      affectedRules: [],
      recommendedAction: "Reassign or remove dependencies connected to inactive/exited actors.",
      estimatedImpact: "High",
      description: `${orphanDeps.length} dependency link(s) reference an actor that is no longer active.`,
      category: "Dependency Risk",
      trace: { actorId: affectedActor?.id, actorName: affectedActor?.name, lifecyclePhase: phase, kpiId: "aor" },
    });
  }

  return risks;
}
