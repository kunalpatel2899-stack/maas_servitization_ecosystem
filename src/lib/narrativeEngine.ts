// AI Governance Consultant — generates an executive narrative from a
// completed AssessmentResult, in the register of a management-consulting
// summary (McKinsey/BCG style): plain declarative sentences, no jargon,
// each claim grounded in a concrete measured signal from the assessment.

import type { AssessmentResult, Ecosystem, LifecyclePhaseName } from "./types";

const NEXT_PHASE: Record<LifecyclePhaseName, LifecyclePhaseName | null> = {
  Emergence: "Evolution",
  Evolution: "Maturity",
  Maturity: "Transformation",
  Transformation: null,
};

export interface ExecutiveNarrative {
  headline: string;
  paragraphs: string[];
  recommendedActions: string[];
}

export function generateExecutiveNarrative(ecosystem: Ecosystem, assessment: AssessmentResult): ExecutiveNarrative {
  const phase = ecosystem.currentPhase;
  const nextPhase = NEXT_PHASE[phase];
  const criticalKPIs = assessment.kpis.filter((k) => k.status === "critical");
  const warningKPIs = assessment.kpis.filter((k) => k.status === "warning");
  const gapCount = assessment.governanceGaps.length + assessment.dependencyRisks.length;
  const transitionReady = assessment.lifecycleReadiness >= 70 && assessment.phaseGate === "PASS";

  const headline = `${ecosystem.name} operates within the ${phase} phase and achieves an overall ROGMA score of ${assessment.rogma.toFixed(1)}, placing the ecosystem in a "${assessment.health}" governance state.`;

  const paragraphs: string[] = [];

  paragraphs.push(headline);

  if (gapCount > 0) {
    const findings: string[] = [];
    const inactiveGap = assessment.governanceGaps.find((g) => g.title === "Inactive Governance Rules");
    if (inactiveGap) findings.push(`Governance rule(s) ${inactiveGap.affectedRules.join(", ")} are currently inactive.`);
    const concentrationRisk = [...assessment.governanceGaps, ...assessment.dependencyRisks].find((g) => g.category === "Concentration Risk");
    if (concentrationRisk) findings.push(`${concentrationRisk.description}`);
    const aorKPI = assessment.kpis.find((k) => k.id === "aor");
    if (aorKPI && aorKPI.status !== "healthy") findings.push(`Actor onboarding remains below target (${aorKPI.current}% vs. ${aorKPI.target}%).`);
    const dscKPI = assessment.kpis.find((k) => k.id === "dsc");
    if (dscKPI && dscKPI.status !== "healthy") findings.push(`Data sovereignty compliance is below the recommended threshold (${dscKPI.current}%).`);

    paragraphs.push(
      `The assessment identified ${gapCount} governance and dependency finding(s) requiring attention. ${findings.slice(0, 3).join(" ")}`.trim()
    );
  } else {
    paragraphs.push("No material governance gaps or dependency risks were identified in this assessment cycle.");
  }

  if (nextPhase) {
    paragraphs.push(
      transitionReady
        ? `Lifecycle readiness stands at ${assessment.lifecycleReadiness}%, and the ecosystem is assessed as ready to progress from ${phase} to ${nextPhase}.`
        : `Lifecycle readiness stands at ${assessment.lifecycleReadiness}%. The ecosystem is not yet ready to transition from ${phase} to ${nextPhase}; the phase gate is currently ${assessment.phaseGate}.`
    );
  } else {
    paragraphs.push(`The ecosystem has reached the Transformation phase, the final stage of the ROGF lifecycle model.`);
  }

  if (criticalKPIs.length > 0) {
    paragraphs.push(
      `${criticalKPIs.length} KPI(s) are in critical status (${criticalKPIs.map((k) => k.shortName).join(", ")}) and warrant immediate governance board attention.`
    );
  } else if (warningKPIs.length > 0) {
    paragraphs.push(`${warningKPIs.length} KPI(s) are trending toward risk thresholds (${warningKPIs.map((k) => k.shortName).join(", ")}) and should be monitored closely.`);
  }

  const recommendedActions = assessment.recommendations.flatMap((r) => r.actions).slice(0, 6);

  return { headline, paragraphs, recommendedActions };
}
