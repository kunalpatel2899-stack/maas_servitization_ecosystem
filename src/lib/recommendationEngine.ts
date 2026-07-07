// AI Decision Support — rule-based recommendation generation from live KPI
// and risk state. Framed as "AI insights" per the platform's decision
// support requirement; implemented as transparent, explainable heuristics
// (appropriate for an academic governance instrument where every
// recommendation must be traceable to a measured signal). Every
// recommendation carries a full traceability block plus the
// priority/impact/difficulty/estimated-improvement fields needed by the
// Decision Support screen.

import type { Actor, Ecosystem, GovernanceRisk, GovernanceRule, KPI, Recommendation, Traceability } from "./types";

let counter = 0;
function recId(): string {
  counter += 1;
  return `rec-${counter}`;
}

export interface RecommendationContext {
  actors: Actor[];
  rules: GovernanceRule[];
  ecosystem: Ecosystem;
}

function ownerOf(rules: GovernanceRule[], ruleId: string): string | undefined {
  return rules.find((r) => r.id === ruleId)?.owner;
}

export function generateRecommendations(kpis: KPI[], risks: GovernanceRisk[], ctx?: RecommendationContext): Recommendation[] {
  const recs: Recommendation[] = [];
  const byId = (id: string) => kpis.find((k) => k.id === id);
  const phase = ctx?.ecosystem.currentPhase;
  const rules = ctx?.rules ?? [];

  const gvs = byId("gvs");
  if (gvs && gvs.status !== "healthy") {
    const trace: Traceability = { governanceRuleId: "G4", lifecyclePhase: phase, kpiId: "gvs" };
    recs.push({
      id: recId(),
      trigger: `Governance Void Score is ${gvs.current} (target ${gvs.target}) — high governance concentration detected.`,
      severity: gvs.status === "critical" ? "Critical" : "High",
      actions: [
        "Activate Governance Rule G4",
        "Assign accountable owners to unclaimed governance roles",
        "Schedule an independent Governance Audit",
      ],
      relatedKPI: "gvs",
      trace,
      priority: gvs.status === "critical" ? "Urgent" : "High",
      estimatedImpact: "High",
      implementationDifficulty: "Moderate",
      estimatedGovernanceImprovement: Math.round((gvs.current - gvs.target) * 0.4 * 10) / 10,
    });
  }

  const cri = byId("cri");
  if (cri && cri.status !== "healthy") {
    recs.push({
      id: recId(),
      trigger: `Concentration Risk Index is ${cri.current} — a Platform Operator or key supplier may represent a single point of failure.`,
      severity: cri.status === "critical" ? "Critical" : "High",
      actions: [
        "Qualify a secondary capacity provider",
        "Cap single-actor transaction share",
        "Introduce redundancy clauses in dependency rules",
      ],
      relatedKPI: "cri",
      trace: { dependencyRuleId: "D12", governanceRuleId: "G14", lifecyclePhase: phase, kpiId: "cri" },
      priority: cri.status === "critical" ? "Urgent" : "High",
      estimatedImpact: "High",
      implementationDifficulty: "Hard",
      estimatedGovernanceImprovement: Math.round((cri.current - cri.target) * 0.35 * 10) / 10,
    });
  }

  const dsc = byId("dsc");
  if (dsc && dsc.status !== "healthy") {
    recs.push({
      id: recId(),
      trigger: `Data Sovereignty Compliance is ${dsc.current}% — below the required threshold.`,
      severity: dsc.status === "critical" ? "Critical" : "High",
      actions: [
        "Reactivate and enforce Data Sovereignty Rule (G8)",
        "Run a data residency compliance audit",
        "Restrict data flows to compliant actors only",
      ],
      relatedKPI: "dsc",
      trace: { governanceRuleId: "G8", dependencyRuleId: "D8", lifecyclePhase: phase, kpiId: "dsc" },
      priority: dsc.status === "critical" ? "Urgent" : "Medium",
      estimatedImpact: "High",
      implementationDifficulty: "Moderate",
      estimatedGovernanceImprovement: Math.round((dsc.target - dsc.current) * 0.3 * 10) / 10,
    });
  }

  const aor = byId("aor");
  if (aor && aor.status !== "healthy") {
    recs.push({
      id: recId(),
      trigger: `Actor Onboarding Rate is ${aor.current}% — onboarding pace is insufficient to sustain ecosystem growth.`,
      severity: aor.status === "critical" ? "High" : "Medium",
      actions: [
        "Streamline the actor onboarding workflow",
        "Prioritize onboarding of Assurance and Support category actors",
      ],
      relatedKPI: "aor",
      trace: { governanceRuleId: "G2", lifecyclePhase: phase, kpiId: "aor" },
      priority: aor.status === "critical" ? "High" : "Medium",
      estimatedImpact: "Medium",
      implementationDifficulty: "Easy",
      estimatedGovernanceImprovement: Math.round((aor.target - aor.current) * 0.2 * 10) / 10,
    });
  }

  const ra = byId("ra");
  if (ra && ra.status !== "healthy") {
    recs.push({
      id: recId(),
      trigger: `Resilience Absorption is ${ra.current} — lifecycle transition should be delayed until resilience improves.`,
      severity: ra.status === "critical" ? "Critical" : "High",
      actions: [
        "Delay Phase Transition until Resilience Absorption exceeds threshold",
        "Run a quarterly resilience stress simulation",
        "Expand redundancy for platform-critical actors",
      ],
      relatedKPI: "ra",
      trace: { governanceRuleId: "G14", dependencyRuleId: "D12", lifecyclePhase: phase, kpiId: "ra" },
      priority: ra.status === "critical" ? "Urgent" : "High",
      estimatedImpact: "High",
      implementationDifficulty: "Hard",
      estimatedGovernanceImprovement: Math.round((ra.target - ra.current) * 0.3 * 10) / 10,
    });
  }

  const spi = byId("spi");
  if (spi && spi.status !== "healthy") {
    recs.push({
      id: recId(),
      trigger: `Service Paradox Indicator is ${spi.current} — realized trust is lagging actor criticality burden.`,
      severity: "Medium",
      actions: ["Invest in relational capital building with high-criticality actors", "Review value-sharing mechanisms"],
      relatedKPI: "spi",
      trace: { lifecyclePhase: phase, kpiId: "spi" },
      priority: "Medium",
      estimatedImpact: "Medium",
      implementationDifficulty: "Moderate",
      estimatedGovernanceImprovement: Math.round((spi.current - spi.target) * 0.15 * 10) / 10,
    });
  }

  // Fold the top governance/dependency risks into recommendations as well,
  // carrying their trace block through unchanged.
  for (const risk of risks.slice(0, 3)) {
    recs.push({
      id: recId(),
      trigger: `${risk.title}: ${risk.description}`,
      severity: risk.severity,
      actions: [risk.recommendedAction],
      relatedKPI: risk.trace.kpiId,
      trace: risk.trace,
      priority: risk.severity === "Critical" ? "Urgent" : risk.severity === "High" ? "High" : "Medium",
      estimatedImpact: risk.estimatedImpact === "Critical" ? "High" : risk.estimatedImpact,
      implementationDifficulty: "Moderate",
      estimatedGovernanceImprovement: risk.severity === "Critical" ? 8 : risk.severity === "High" ? 5 : 2,
    });
  }

  return recs.slice(0, 8);
}
