// Governance Validation Engine — run BEFORE a ROGMA Assessment. Checks that
// enough structured data exists to produce a scientifically meaningful
// result, rather than silently computing KPIs from a near-empty ecosystem.
// If confidence is too low, the Assessment module blocks the "Run"
// action and instead shows exactly what is missing.

import type { Actor, Dependency, Ecosystem, GovernanceRule } from "./types";
import { clamp } from "./utils";
import dependencyRuleCatalog from "@/config/dependencyRules.json";

export interface ValidationResult {
  governanceCompleteness: number;
  actorCompleteness: number;
  dependencyCompleteness: number;
  dataQuality: number;
  confidence: number;
  missingInfo: string[];
  status: "Assessment Ready" | "Insufficient Data";
}

const EXPECTED_RULE_COUNT = 14;
const VALID_DEPENDENCY_RULE_IDS = new Set((dependencyRuleCatalog as { id: string }[]).map((r) => r.id));

export function validateEcosystem(
  ecosystem: Ecosystem,
  actors: Actor[],
  dependencies: Dependency[],
  rules: GovernanceRule[]
): ValidationResult {
  const missingInfo: string[] = [];

  // --- Governance completeness -----------------------------------------
  const rulePresenceRatio = clamp((rules.length / EXPECTED_RULE_COUNT) * 100);
  const rulesWithOwner = rules.filter((r) => r.owner && r.owner.trim().length > 0);
  const ownerRatio = rules.length > 0 ? (rulesWithOwner.length / rules.length) * 100 : 0;
  const governanceCompleteness = Math.round(clamp(rulePresenceRatio * 0.5 + ownerRatio * 0.5));
  if (rules.length < EXPECTED_RULE_COUNT) {
    missingInfo.push(`Only ${rules.length} of ${EXPECTED_RULE_COUNT} standard governance rules are configured.`);
  }
  const unownedRules = rules.filter((r) => !r.owner || r.owner.trim().length === 0);
  if (unownedRules.length > 0) {
    missingInfo.push(`${unownedRules.length} governance rule(s) have no assigned owner: ${unownedRules.map((r) => r.id).join(", ")}.`);
  }

  // --- Actor completeness ------------------------------------------------
  let actorFieldScore = 0;
  const actorsMissingFields: string[] = [];
  for (const a of actors) {
    const fields = [a.name, a.role, a.country, a.capabilities.length > 0, a.resources.length > 0];
    const filled = fields.filter(Boolean).length;
    actorFieldScore += filled / fields.length;
    if (filled < fields.length) actorsMissingFields.push(a.name || "(unnamed actor)");
  }
  const avgActorFieldScore = actors.length > 0 ? (actorFieldScore / actors.length) * 100 : 0;
  if (actorsMissingFields.length > 0) {
    missingInfo.push(`${actorsMissingFields.length} actor(s) have incomplete profiles (missing role, country, capabilities or resources).`);
  }

  const hasPlatformOperator = actors.some((a) => a.type === "Platform Operator");
  const hasRegulator = actors.some((a) => a.type === "Regulator");
  if (!hasPlatformOperator) missingInfo.push("No Platform Operator actor is defined — orchestration KPIs may be unreliable.");
  if (!hasRegulator) missingInfo.push("No Regulator actor is defined — compliance-related KPIs may be unreliable.");
  const structuralPenalty = (hasPlatformOperator ? 0 : 15) + (hasRegulator ? 0 : 10);

  let actorCompleteness = Math.round(clamp(avgActorFieldScore - structuralPenalty));
  if (actors.length < 3) {
    missingInfo.push(`Only ${actors.length} actor(s) registered — at least 3 are recommended for a meaningful assessment.`);
    actorCompleteness = Math.round(clamp(actorCompleteness * (actors.length / 3)));
  }

  // --- Dependency completeness -------------------------------------------
  const connectedActorIds = new Set(dependencies.flatMap((d) => [d.fromActorId, d.toActorId]));
  const unconnectedActors = actors.filter((a) => !connectedActorIds.has(a.id));
  const connectivityRatio = actors.length > 0 ? ((actors.length - unconnectedActors.length) / actors.length) * 100 : 0;
  const depsWithRule = dependencies.filter((d) => d.ruleId && VALID_DEPENDENCY_RULE_IDS.has(d.ruleId));
  const ruleAssignmentRatio = dependencies.length > 0 ? (depsWithRule.length / dependencies.length) * 100 : 0;
  const dependencyCompleteness = Math.round(clamp(connectivityRatio * 0.6 + ruleAssignmentRatio * 0.4));
  if (unconnectedActors.length > 0) {
    missingInfo.push(`${unconnectedActors.length} actor(s) have no dependency links: ${unconnectedActors.map((a) => a.name).join(", ")}.`);
  }
  if (dependencies.length === 0) {
    missingInfo.push("No dependencies have been mapped yet — network-based KPIs (Concentration Risk, Resilience Absorption) cannot be computed reliably.");
  }

  // --- Data quality (anomaly detection) -----------------------------------
  let qualityPenalty = 0;
  const nameCounts = new Map<string, number>();
  for (const a of actors) nameCounts.set(a.name.trim().toLowerCase(), (nameCounts.get(a.name.trim().toLowerCase()) ?? 0) + 1);
  const duplicateNames = [...nameCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateNames.length > 0) {
    qualityPenalty += 15;
    missingInfo.push(`Duplicate actor name(s) detected: ${duplicateNames.map(([n]) => n).join(", ")}.`);
  }
  const selfLoops = dependencies.filter((d) => d.fromActorId === d.toActorId);
  if (selfLoops.length > 0) {
    qualityPenalty += 10;
    missingInfo.push(`${selfLoops.length} dependency(ies) connect an actor to itself.`);
  }
  const orphanDeps = dependencies.filter(
    (d) => !actors.some((a) => a.id === d.fromActorId) || !actors.some((a) => a.id === d.toActorId)
  );
  if (orphanDeps.length > 0) {
    qualityPenalty += 15;
    missingInfo.push(`${orphanDeps.length} dependency(ies) reference an actor that no longer exists.`);
  }
  const dataQuality = Math.round(clamp(100 - qualityPenalty));

  // --- Confidence & status ------------------------------------------------
  const confidence = Math.round(
    clamp(governanceCompleteness * 0.3 + actorCompleteness * 0.3 + dependencyCompleteness * 0.25 + dataQuality * 0.15)
  );

  const status: ValidationResult["status"] =
    confidence >= 70 && governanceCompleteness >= 50 && actorCompleteness >= 50 && dependencyCompleteness >= 40
      ? "Assessment Ready"
      : "Insufficient Data";

  if (status === "Insufficient Data" && missingInfo.length === 0) {
    missingInfo.push("Overall data confidence is below the threshold required for a reliable assessment.");
  }

  return { governanceCompleteness, actorCompleteness, dependencyCompleteness, dataQuality, confidence, missingInfo, status };
}
