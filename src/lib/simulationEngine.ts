// What-If Simulation engine (v2) — operates on REAL ecosystem entities
// (actors, dependencies, governance rules) rather than static deltas.
// `applyScenario` returns a modified deep copy; the caller re-runs the
// KPI/ROGMA/risk/recommendation engines against that copy so every
// downstream view (network, KPIs, ROGMA, recommendations, lifecycle, risk)
// updates immediately and consistently.

import type { Actor, Dependency, GovernanceRule, SimulationInputs } from "./types";
import { clamp } from "./utils";

export const DEFAULT_SIMULATION_INPUTS: SimulationInputs = {
  actorExitId: null,
  cyberAttackSeverity: 0,
  platformFailureSeverity: 0,
  governanceChangeDelta: 0,
  regulatoryChangeSeverity: 0,
  lowInteroperabilitySeverity: 0,
  newActorJoins: false,
};

export function isScenarioActive(inputs: SimulationInputs): boolean {
  return (
    inputs.actorExitId !== null ||
    inputs.cyberAttackSeverity > 0 ||
    inputs.platformFailureSeverity > 0 ||
    inputs.governanceChangeDelta !== 0 ||
    inputs.regulatoryChangeSeverity > 0 ||
    inputs.lowInteroperabilitySeverity > 0 ||
    inputs.newActorJoins
  );
}

export function applyScenario(
  actors: Actor[],
  dependencies: Dependency[],
  rules: GovernanceRule[],
  inputs: SimulationInputs
): { actors: Actor[]; dependencies: Dependency[]; rules: GovernanceRule[] } {
  let nextActors = actors.map((a) => ({ ...a }));
  let nextDeps = dependencies.map((d) => ({ ...d }));
  let nextRules = rules.map((r) => ({ ...r }));

  // 1. Actor exit
  if (inputs.actorExitId) {
    nextActors = nextActors.map((a) => (a.id === inputs.actorExitId ? { ...a, status: "Exited" as const } : a));
    nextDeps = nextDeps.map((d) =>
      d.fromActorId === inputs.actorExitId || d.toActorId === inputs.actorExitId
        ? { ...d, status: "Broken" as const }
        : d
    );
  }

  // 2. Cyber attack — degrades data/resilience rule compliance and trust of security-critical actors
  if (inputs.cyberAttackSeverity > 0) {
    const s = inputs.cyberAttackSeverity;
    nextRules = nextRules.map((r) =>
      r.category === "Data" || r.category === "Resilience"
        ? { ...r, compliance: clamp(r.compliance - s * 0.5) }
        : r
    );
    nextActors = nextActors.map((a) =>
      a.type === "Data Platform" || a.type === "Security Provider"
        ? { ...a, trustLevel: clamp(a.trustLevel - s * 0.4), criticality: s > 60 ? "Critical" : a.criticality }
        : a
    );
    nextDeps = nextDeps.map((d) =>
      d.dependencyType === "Data" && s > 40 ? { ...d, status: "At Risk" as const } : d
    );
  }

  // 3. Platform operator failure — degrades the orchestrator and its technology dependencies
  if (inputs.platformFailureSeverity > 0) {
    const s = inputs.platformFailureSeverity;
    nextActors = nextActors.map((a) =>
      a.type === "Platform Operator" ? { ...a, authorityLevel: clamp(a.authorityLevel - s * 0.5), trustLevel: clamp(a.trustLevel - s * 0.3) } : a
    );
    const operatorIds = new Set(nextActors.filter((a) => a.type === "Platform Operator").map((a) => a.id));
    nextDeps = nextDeps.map((d) =>
      (operatorIds.has(d.fromActorId) || operatorIds.has(d.toActorId)) && s > 35
        ? { ...d, status: "At Risk" as const }
        : d
    );
  }

  // 4. Governance change — uniformly shifts compliance of active rules (+ improve / - decline)
  if (inputs.governanceChangeDelta !== 0) {
    const d = inputs.governanceChangeDelta;
    nextRules = nextRules.map((r) => (r.active ? { ...r, compliance: clamp(r.compliance + d * 0.5) } : r));
  }

  // 5. Regulatory change — tightens compliance-category rules (simulating a new/uncertain regulation)
  if (inputs.regulatoryChangeSeverity > 0) {
    const s = inputs.regulatoryChangeSeverity;
    nextRules = nextRules.map((r) => (r.category === "Compliance" ? { ...r, compliance: clamp(r.compliance - s * 0.4) } : r));
  }

  // 6. Low interoperability — degrades the interoperability standard rule + technology/data dependency strength
  if (inputs.lowInteroperabilitySeverity > 0) {
    const s = inputs.lowInteroperabilitySeverity;
    nextRules = nextRules.map((r) => (r.id === "G10" ? { ...r, compliance: clamp(r.compliance - s * 0.6) } : r));
    nextDeps = nextDeps.map((d) =>
      d.dependencyType === "Technology" || d.dependencyType === "Data"
        ? { ...d, strength: clamp(d.strength - s * 0.3) }
        : d
    );
  }

  // 7. New actor joins — adds a well-trusted support actor connected to the platform operator
  if (inputs.newActorJoins) {
    const operator = nextActors.find((a) => a.type === "Platform Operator");
    const newActor: Actor = {
      id: `sim-new-actor-${Date.now()}`,
      ecosystemId: nextActors[0]?.ecosystemId ?? "",
      name: "New Entrant Co.",
      type: "Manufacturing Provider",
      role: "Capacity Provider",
      authorityLevel: 45,
      trustLevel: 60,
      criticality: "Low",
      platformMember: true,
      country: operator?.country ?? "Unknown",
      capabilities: ["General Manufacturing"],
      resources: ["New Facility"],
      status: "Onboarding",
    };
    nextActors = [...nextActors, newActor];
    if (operator) {
      nextDeps = [
        ...nextDeps,
        {
          id: `sim-new-dep-${Date.now()}`,
          ecosystemId: newActor.ecosystemId,
          fromActorId: operator.id,
          toActorId: newActor.id,
          dependencyType: "Technology",
          strength: 40,
          ruleId: "G2",
          criticality: "Low",
          status: "Active",
        },
      ];
    }
  }

  return { actors: nextActors, dependencies: nextDeps, rules: nextRules };
}
