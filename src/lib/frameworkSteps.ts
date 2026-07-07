// The 10-step ROGF methodology that the platform guides users through.
// Each step maps to a concrete route and a completion predicate computed
// from live store state — this is what turns the sidebar from a page list
// into a visual representation of the research methodology itself.

import type { Actor, AssessmentResult, Dependency, Ecosystem, GovernanceRule, KPI } from "./types";
import { computeCriteria } from "./lifecycleCriteria";

export interface FrameworkStepContext {
  ecosystem: Ecosystem | null;
  actors: Actor[];
  dependencies: Dependency[];
  rules: GovernanceRule[];
  kpis: KPI[];
  assessment: AssessmentResult | null;
  hasSimulated: boolean;
  hasGeneratedReport: boolean;
}

export interface FrameworkStep {
  step: number;
  label: string;
  href: string;
  description: string;
  isComplete: (ctx: FrameworkStepContext) => boolean;
}

export const FRAMEWORK_STEPS: FrameworkStep[] = [
  {
    step: 1,
    label: "Create Ecosystem",
    href: "/ecosystem-builder",
    description: "Define the ecosystem's identity, platform and lifecycle starting point.",
    isComplete: (ctx) => !!ctx.ecosystem,
  },
  {
    step: 2,
    label: "Actor Registry",
    href: "/actors",
    description: "Register the actors that participate in ecosystem governance.",
    isComplete: (ctx) => ctx.actors.length >= 3,
  },
  {
    step: 3,
    label: "Dependency Mapping",
    href: "/dependencies",
    description: "Model the dependency relationships that connect actors.",
    isComplete: (ctx) => ctx.dependencies.length >= 1,
  },
  {
    step: 4,
    label: "Governance Rules",
    href: "/governance",
    description: "Configure which governance rules are active and how well they are followed.",
    isComplete: (ctx) => ctx.rules.some((r) => r.active),
  },
  {
    step: 5,
    label: "Lifecycle Configuration",
    href: "/lifecycle",
    description: "Confirm the ecosystem's current lifecycle phase and review its criteria.",
    isComplete: (ctx) => {
      if (!ctx.ecosystem) return false;
      const criteria = computeCriteria(ctx.ecosystem.currentPhase, ctx.ecosystem, ctx.actors, ctx.dependencies, ctx.rules, ctx.kpis);
      return criteria.some((c) => c.met);
    },
  },
  {
    step: 6,
    label: "Governance Assessment",
    href: "/assessment",
    description: "Validate data sufficiency and run the full governance assessment.",
    isComplete: (ctx) => !!ctx.assessment,
  },
  {
    step: 7,
    label: "ROGMA Analysis",
    href: "/rogma-analysis",
    description: "Break down the ROGMA composite score into its KPI contributions.",
    isComplete: (ctx) => !!ctx.assessment,
  },
  {
    step: 8,
    label: "Recommendations",
    href: "/decision-support",
    description: "Review the executive narrative and prioritized governance actions.",
    isComplete: (ctx) => !!ctx.assessment,
  },
  {
    step: 9,
    label: "Scenario Simulation",
    href: "/simulation",
    description: "Stress-test the ecosystem against disruption scenarios.",
    isComplete: (ctx) => ctx.hasSimulated,
  },
  {
    step: 10,
    label: "Report Generation",
    href: "/reports",
    description: "Export a full governance assessment report for stakeholders.",
    isComplete: (ctx) => ctx.hasGeneratedReport,
  },
];
