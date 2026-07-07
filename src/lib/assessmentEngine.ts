// Orchestrates a full "Run Governance Assessment" pass: calculates every
// KPI, the ROGMA composite, ecosystem health, lifecycle readiness,
// governance gaps, dependency risks and recommendations — all from the
// current ecosystem's live actors/dependencies/rules.

import type { AssessmentResult, Ecosystem, Actor, Dependency, GovernanceRule, KPIDefinition, LifecyclePhaseName } from "./types";
import { calculateKPIs, calculateROGMA, rogmaStatus, derivePhaseGate, transitionReadiness } from "./kpiEngine";
import { deriveGovernanceGaps, deriveDependencyRisks } from "./riskEngine";
import { generateRecommendations } from "./recommendationEngine";

const REQUIRED_KPIS_BY_PHASE: Record<LifecyclePhaseName, string[]> = {
  Emergence: ["aor"],
  Evolution: ["gvs", "cri", "pcm"],
  Maturity: ["ra", "ccr", "dsc"],
  Transformation: ["alr", "rc"],
};

export function runAssessment(
  ecosystem: Ecosystem,
  actors: Actor[],
  dependencies: Dependency[],
  rules: GovernanceRule[],
  kpiDefinitions: KPIDefinition[]
): AssessmentResult {
  const kpis = calculateKPIs({ ecosystem, actors, dependencies, rules }, kpiDefinitions);
  const rogma = calculateROGMA(kpis);
  const health = rogmaStatus(rogma);
  const phaseGate = derivePhaseGate(kpis);
  const requiredKPIs = REQUIRED_KPIS_BY_PHASE[ecosystem.currentPhase] ?? [];
  const lifecycleReadiness = transitionReadiness(kpis, requiredKPIs);
  const governanceGaps = deriveGovernanceGaps(rules, kpis, ecosystem);
  const dependencyRisks = deriveDependencyRisks(actors, dependencies, ecosystem);
  const recommendations = generateRecommendations(kpis, [...governanceGaps, ...dependencyRisks], { actors, rules, ecosystem });

  return {
    id: `assessment-${Date.now()}`,
    ecosystemId: ecosystem.id,
    timestamp: new Date().toISOString(),
    rogma,
    health,
    kpis,
    lifecycleReadiness,
    phaseGate,
    governanceGaps,
    dependencyRisks,
    recommendations,
  };
}

export { REQUIRED_KPIS_BY_PHASE };
