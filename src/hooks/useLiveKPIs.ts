"use client";

import { useMemo } from "react";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import { calculateKPIs, calculateROGMA, rogmaStatus, derivePhaseGate } from "@/lib/kpiEngine";
import type { Actor, Dependency, Ecosystem, GovernanceRule, KPIDefinition } from "@/lib/types";

/** Central hook computing live KPIs + ROGMA + health + phase gate for a
 *  given (possibly simulation-modified) ecosystem context. Used by the
 *  Dashboard, Lifecycle, ROGMA Assessment and Simulation modules so they
 *  always agree on the same numbers. */
export function useLiveKPIs(
  ecosystem: Ecosystem | null,
  actors: Actor[],
  dependencies: Dependency[],
  rules: GovernanceRule[]
) {
  return useMemo(() => {
    if (!ecosystem) {
      return { kpis: [], rogma: 0, health: "Critical" as const, phaseGate: "FAIL" as const };
    }
    const kpis = calculateKPIs(
      { ecosystem, actors, dependencies, rules },
      kpiDefinitions as KPIDefinition[]
    );
    const rogma = calculateROGMA(kpis);
    const health = rogmaStatus(rogma);
    const phaseGate = derivePhaseGate(kpis);
    return { kpis, rogma, health, phaseGate };
  }, [ecosystem, actors, dependencies, rules]);
}
