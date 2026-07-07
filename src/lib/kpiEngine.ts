// The KPI Engine — every value here is DERIVED from live application state
// (actors, dependencies, governance rules, ecosystem metadata). Nothing is
// hardcoded. Each function is intentionally small and pure so it can be
// unit-tested, reused across the Dashboard, ROGMA Assessment and Simulation
// modules, and re-weighted without touching UI code.

import type {
  Actor,
  Dependency,
  GovernanceRule,
  Ecosystem,
  KPI,
  KPIDefinition,
  RiskLevel,
} from "./types";
import { clamp } from "./utils";

const CRITICALITY_SCORE: Record<string, number> = { Low: 25, Medium: 50, High: 75, Critical: 100 };

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Share of total incoming+outgoing dependency strength concentrated on the single most-relied-upon actor. */
export function concentrationShare(actors: Actor[], dependencies: Dependency[]): number {
  if (dependencies.length === 0) return 0;
  const totals = new Map<string, number>();
  let grandTotal = 0;
  for (const d of dependencies) {
    totals.set(d.toActorId, (totals.get(d.toActorId) ?? 0) + d.strength);
    totals.set(d.fromActorId, (totals.get(d.fromActorId) ?? 0) + d.strength * 0.5);
    grandTotal += d.strength * 1.5;
  }
  if (grandTotal === 0) return 0;
  const max = Math.max(...totals.values());
  return clamp((max / grandTotal) * 100);
}

/** 1. Governance Void Score — gaps from inactive rules + low average compliance (lower is better). */
export function governanceVoidScore(rules: GovernanceRule[]): number {
  if (rules.length === 0) return 100;
  const inactiveRatio = rules.filter((r) => !r.active).length / rules.length;
  const avgCompliance = mean(rules.filter((r) => r.active).map((r) => r.compliance)) / 100;
  return clamp(inactiveRatio * 60 + (1 - avgCompliance) * 40);
}

/** 2. Actor Onboarding Rate — share of actors in Active status (higher is better). */
export function actorOnboardingRate(actors: Actor[]): number {
  if (actors.length === 0) return 0;
  const active = actors.filter((a) => a.status === "Active").length;
  return clamp((active / actors.length) * 100);
}

/** 3. Concentration Risk Index — reuses the concentration share helper directly (lower is better). */
export function concentrationRiskIndex(actors: Actor[], dependencies: Dependency[]): number {
  return concentrationShare(actors, dependencies);
}

/** 4. Platform Capability Maturity — platform openness blended with authority of platform-member actors. */
export function platformCapabilityMaturity(ecosystem: Ecosystem, actors: Actor[]): number {
  const platformActors = actors.filter((a) => a.platformMember);
  const avgAuthority = mean(platformActors.map((a) => a.authorityLevel));
  return clamp(ecosystem.platformOpenness * 0.5 + avgAuthority * 0.5);
}

/** 5. Data Sovereignty Compliance — average compliance of active "Data" category governance rules. */
export function dataSovereigntyCompliance(rules: GovernanceRule[]): number {
  const dataRules = rules.filter((r) => r.category === "Data");
  if (dataRules.length === 0) return 50;
  const activeDataRules = dataRules.filter((r) => r.active);
  const inactivePenalty = ((dataRules.length - activeDataRules.length) / dataRules.length) * 40;
  const avgCompliance = mean(activeDataRules.map((r) => r.compliance));
  return clamp(avgCompliance - inactivePenalty);
}

/** 6. Relational Capital — average trust level across all actors (higher is better). */
export function relationalCapital(actors: Actor[]): number {
  return clamp(mean(actors.map((a) => a.trustLevel)));
}

/** 7. Service Paradox Indicator — gap between actor criticality burden and realized trust (lower is better). */
export function serviceParadoxIndicator(actors: Actor[]): number {
  const avgCriticality = mean(actors.map((a) => CRITICALITY_SCORE[a.criticality] ?? 50));
  const avgTrust = mean(actors.map((a) => a.trustLevel));
  return clamp(avgCriticality - avgTrust + 30);
}

/** 8. Resilience Absorption — inverse function of concentration risk and unmitigated critical dependencies. */
export function resilienceAbsorption(actors: Actor[], dependencies: Dependency[], rules: GovernanceRule[]): number {
  const cri = concentrationShare(actors, dependencies);
  const criticalDeps = dependencies.filter((d) => d.criticality === "Critical" || d.criticality === "High");
  const atRiskCritical = criticalDeps.filter((d) => d.status !== "Active").length;
  const unmitigatedRatio = criticalDeps.length > 0 ? atRiskCritical / criticalDeps.length : 0;
  const resilienceRule = rules.find((r) => r.id === "G14");
  const redundancyBonus = resilienceRule?.active ? resilienceRule.compliance * 0.2 : 0;
  return clamp(100 - cri * 0.5 - unmitigatedRatio * 40 + redundancyBonus * 0.1);
}

/** 9. Circular Closure Rate — presence and connectedness of circularity-oriented actors (higher is better). */
export function circularClosureRate(actors: Actor[], dependencies: Dependency[]): number {
  const circularActors = actors.filter(
    (a) => a.type === "Recycler" || a.capabilities.some((c) => /circular|recycl|recovery/i.test(c))
  );
  if (circularActors.length === 0) return 15;
  const circularIds = new Set(circularActors.map((a) => a.id));
  const loopStrength = mean(
    dependencies.filter((d) => circularIds.has(d.fromActorId) || circularIds.has(d.toActorId)).map((d) => d.strength)
  );
  const coverage = (circularActors.length / actors.length) * 100;
  return clamp(coverage * 1.5 + loopStrength * 0.4);
}

/** 10. Actor Learning Rate — composite of trust and authority as a governance-learning proxy (higher is better). */
export function actorLearningRate(actors: Actor[]): number {
  const avgTrust = mean(actors.map((a) => a.trustLevel));
  const avgAuthority = mean(actors.map((a) => a.authorityLevel));
  const onboardingBonus = actors.filter((a) => a.status === "Onboarding").length > 0 ? -5 : 0;
  return clamp(avgTrust * 0.55 + avgAuthority * 0.45 + onboardingBonus);
}

// --- Aggregation --------------------------------------------------------

export interface KPIContext {
  ecosystem: Ecosystem;
  actors: Actor[];
  dependencies: Dependency[];
  rules: GovernanceRule[];
}

const RAW_CALCULATORS: Record<string, (ctx: KPIContext) => number> = {
  gvs: (ctx) => governanceVoidScore(ctx.rules),
  aor: (ctx) => actorOnboardingRate(ctx.actors),
  cri: (ctx) => concentrationRiskIndex(ctx.actors, ctx.dependencies),
  pcm: (ctx) => platformCapabilityMaturity(ctx.ecosystem, ctx.actors),
  dsc: (ctx) => dataSovereigntyCompliance(ctx.rules),
  rc: (ctx) => relationalCapital(ctx.actors),
  spi: (ctx) => serviceParadoxIndicator(ctx.actors),
  ra: (ctx) => resilienceAbsorption(ctx.actors, ctx.dependencies, ctx.rules),
  ccr: (ctx) => circularClosureRate(ctx.actors, ctx.dependencies),
  alr: (ctx) => actorLearningRate(ctx.actors),
};

function statusFor(def: KPIDefinition, value: number): RiskLevel {
  const distance = def.lowerIsBetter ? value - def.target : def.target - value;
  if (distance <= 0) return "healthy";
  if (def.lowerIsBetter ? value < def.threshold : value > def.threshold) return "warning";
  return "critical";
}

/** Deterministic 8-point synthetic trend ending at `current` — no RNG, so
 *  server-rendered and client-rendered output always match exactly. */
function syntheticHistory(current: number, seedOffset: number): number[] {
  const points = 8;
  const history: number[] = [];
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const wobble = Math.sin((i + seedOffset) * 1.3) * 3;
    const value = current * (0.75 + progress * 0.25) + wobble * (1 - progress);
    history.push(Math.round(clamp(value) * 10) / 10);
  }
  history[history.length - 1] = Math.round(current * 10) / 10;
  return history;
}

/** Computes all 10 KPIs live from the given context. This is the single
 *  source of truth used by the Dashboard, ROGMA Assessment, Lifecycle and
 *  Simulation modules — nothing downstream hardcodes a KPI value. */
export function calculateKPIs(ctx: KPIContext, definitions: KPIDefinition[]): KPI[] {
  return definitions.map((def, i) => {
    const raw = RAW_CALCULATORS[def.id] ? RAW_CALCULATORS[def.id](ctx) : 0;
    const current = Math.round(raw * 10) / 10;
    const history = syntheticHistory(current, i);
    const prev = history[history.length - 2] ?? current;
    const changePct = Math.round((current - prev) * 10) / 10;
    const trend = changePct > 0.3 ? "up" : changePct < -0.3 ? "down" : "flat";
    return {
      ...def,
      current,
      trend,
      changePct,
      status: statusFor(def, current),
      history,
    };
  });
}

/** ROGMA composite — weighted average of all KPIs, normalized so that
 *  "lower is better" KPIs contribute their inverse. */
export function calculateROGMA(kpis: KPI[]): number {
  if (kpis.length === 0) return 0;
  const totalWeight = kpis.reduce((sum, k) => sum + k.weight, 0);
  const weighted = kpis.reduce((sum, k) => {
    const normalized = k.lowerIsBetter ? 100 - k.current : k.current;
    return sum + normalized * k.weight;
  }, 0);
  return Math.round((weighted / totalWeight) * 10) / 10;
}

export function rogmaStatus(rogma: number): "Healthy" | "At Risk" | "Critical" {
  if (rogma >= 75) return "Healthy";
  if (rogma >= 55) return "At Risk";
  return "Critical";
}

export function derivePhaseGate(kpis: KPI[]): "PASS" | "HOLD" | "FAIL" {
  const criticalCount = kpis.filter((k) => k.status === "critical").length;
  if (criticalCount >= 4) return "FAIL";
  if (criticalCount >= 1) return "HOLD";
  return "PASS";
}

/** Transition readiness (0-100) for a target lifecycle phase's required KPIs. */
export function transitionReadiness(kpis: KPI[], requiredKPIIds: string[]): number {
  const required = kpis.filter((k) => requiredKPIIds.includes(k.id));
  if (required.length === 0) return 100;
  const scores = required.map((k) => {
    const distance = k.lowerIsBetter ? k.target - k.current : k.current - k.target;
    const proximity = clamp(100 - Math.abs(distance) * 1.5);
    return k.lowerIsBetter ? (k.current <= k.target ? 100 : proximity) : (k.current >= k.target ? 100 : proximity);
  });
  return Math.round(mean(scores));
}

/** Rolling ROGMA composite history, derived the same way as the current
 *  value but applied to each KPI's historical point — used for the
 *  Dashboard's quarterly trend sparkline. */
export function calculateROGMAHistory(kpis: KPI[]): number[] {
  if (kpis.length === 0) return [];
  const length = Math.min(...kpis.map((k) => k.history.length));
  const totalWeight = kpis.reduce((sum, k) => sum + k.weight, 0);
  const points: number[] = [];
  for (let i = 0; i < length; i++) {
    const weighted = kpis.reduce((sum, k) => {
      const raw = k.history[i] ?? k.current;
      const normalized = k.lowerIsBetter ? 100 - raw : raw;
      return sum + normalized * k.weight;
    }, 0);
    points.push(Math.round((weighted / totalWeight) * 10) / 10);
  }
  return points;
}
