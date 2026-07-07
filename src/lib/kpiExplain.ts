// Builds the live, data-grounded portion of a KPI's explanation: current
// input values pulled from the actual ecosystem, a plain-language reason,
// and this KPI's percentage contribution to the overall ROGMA composite.
// Static definitional content (formula, variables, literature source) lives
// in src/config/kpiScience.json — this file supplies the "why this number,
// right now" half of the Explain modal.

import type { Actor, Dependency, Ecosystem, GovernanceRule, KPI } from "./types";
import { concentrationShare } from "./kpiEngine";

export interface KPIExplanation {
  currentInputs: { label: string; value: string }[];
  reasoning: string[];
  contributionPct: number;
}

function pct(n: number): string {
  return `${Math.round(n * 10) / 10}%`;
}

export function explainKPI(
  kpi: KPI,
  ctx: { ecosystem: Ecosystem; actors: Actor[]; dependencies: Dependency[]; rules: GovernanceRule[] },
  allKpis: KPI[]
): KPIExplanation {
  const { actors, dependencies, rules, ecosystem } = ctx;
  const totalWeight = allKpis.reduce((s, k) => s + k.weight, 0);
  const normalized = kpi.lowerIsBetter ? 100 - kpi.current : kpi.current;
  const contributionPct = totalWeight > 0 ? Math.round(((normalized * kpi.weight) / (totalWeight * 100)) * 1000) / 10 : 0;

  let currentInputs: { label: string; value: string }[] = [];
  let reasoning: string[] = [];

  switch (kpi.id) {
    case "gvs": {
      const inactive = rules.filter((r) => !r.active);
      const activeAvg = rules.filter((r) => r.active).reduce((s, r) => s + r.compliance, 0) / Math.max(1, rules.filter((r) => r.active).length);
      currentInputs = [
        { label: "Inactive Rules", value: `${inactive.length} of ${rules.length}` },
        { label: "Average Active Compliance", value: pct(activeAvg) },
      ];
      reasoning = [
        inactive.length > 0
          ? `${inactive.length} governance rule(s) inactive: ${inactive.map((r) => r.id).join(", ")}.`
          : "All governance rules are currently active.",
        `Average compliance across active rules is ${pct(activeAvg)}.`,
      ];
      break;
    }
    case "aor": {
      const active = actors.filter((a) => a.status === "Active").length;
      currentInputs = [{ label: "Active Actors", value: `${active} of ${actors.length}` }];
      reasoning = [`${active} of ${actors.length} registered actors are in Active status.`];
      break;
    }
    case "cri": {
      const share = concentrationShare(actors, dependencies);
      currentInputs = [{ label: "Max Actor Dependency Share", value: pct(share) }];
      reasoning = [`The single most-relied-upon actor accounts for ${pct(share)} of total dependency strength.`];
      break;
    }
    case "pcm": {
      const platformActors = actors.filter((a) => a.platformMember);
      const avgAuthority = platformActors.reduce((s, a) => s + a.authorityLevel, 0) / Math.max(1, platformActors.length);
      currentInputs = [
        { label: "Platform Openness", value: pct(ecosystem.platformOpenness) },
        { label: "Avg. Authority (Platform Members)", value: `${Math.round(avgAuthority)}` },
      ];
      reasoning = [`Platform openness is set to ${pct(ecosystem.platformOpenness)} with ${platformActors.length} platform-member actor(s).`];
      break;
    }
    case "dsc": {
      const dataRules = rules.filter((r) => r.category === "Data");
      const activeData = dataRules.filter((r) => r.active);
      currentInputs = [{ label: "Active Data Rules", value: `${activeData.length} of ${dataRules.length}` }];
      reasoning = [
        dataRules.length === 0
          ? "No data-category governance rules are configured for this ecosystem."
          : `${activeData.length} of ${dataRules.length} data-category rules are active.`,
      ];
      break;
    }
    case "rc": {
      const avgTrust = actors.reduce((s, a) => s + a.trustLevel, 0) / Math.max(1, actors.length);
      currentInputs = [{ label: "Average Trust Level", value: `${Math.round(avgTrust)}` }];
      reasoning = [`Average actor trust level across the ecosystem is ${Math.round(avgTrust)}.`];
      break;
    }
    case "spi": {
      const avgTrust = actors.reduce((s, a) => s + a.trustLevel, 0) / Math.max(1, actors.length);
      currentInputs = [{ label: "Average Trust Level", value: `${Math.round(avgTrust)}` }];
      reasoning = [`A gap between actor criticality burden and realized trust (avg. trust ${Math.round(avgTrust)}) indicates value-capture friction.`];
      break;
    }
    case "ra": {
      const share = concentrationShare(actors, dependencies);
      const criticalDeps = dependencies.filter((d) => d.criticality === "Critical" || d.criticality === "High");
      const atRisk = criticalDeps.filter((d) => d.status !== "Active").length;
      currentInputs = [
        { label: "Concentration Share", value: pct(share) },
        { label: "Unstable Critical Dependencies", value: `${atRisk} of ${criticalDeps.length}` },
      ];
      reasoning = [`${atRisk} of ${criticalDeps.length} critical/high dependencies are not in Active status, combined with ${pct(share)} concentration share.`];
      break;
    }
    case "ccr": {
      const circular = actors.filter((a) => a.type === "Recycler" || a.capabilities.some((c) => /circular|recycl|recovery/i.test(c)));
      currentInputs = [{ label: "Circular Actors", value: `${circular.length} of ${actors.length}` }];
      reasoning = [
        circular.length === 0
          ? "No circularity-oriented actor (e.g. Recycler) is present in this ecosystem."
          : `${circular.length} circularity-oriented actor(s) are present and connected into the dependency network.`,
      ];
      break;
    }
    case "alr": {
      const avgTrust = actors.reduce((s, a) => s + a.trustLevel, 0) / Math.max(1, actors.length);
      const avgAuthority = actors.reduce((s, a) => s + a.authorityLevel, 0) / Math.max(1, actors.length);
      const onboarding = actors.filter((a) => a.status === "Onboarding").length;
      currentInputs = [
        { label: "Average Trust", value: `${Math.round(avgTrust)}` },
        { label: "Average Authority", value: `${Math.round(avgAuthority)}` },
        { label: "Actors Onboarding", value: `${onboarding}` },
      ];
      reasoning = [`Blended from average trust (${Math.round(avgTrust)}) and authority (${Math.round(avgAuthority)})${onboarding > 0 ? `, with a penalty applied while ${onboarding} actor(s) are still onboarding.` : "."}`];
      break;
    }
  }

  return { currentInputs, reasoning, contributionPct };
}
