"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

import type {
  Actor,
  AssessmentResult,
  Dependency,
  Ecosystem,
  GovernanceRule,
  SimulationInputs,
} from "@/lib/types";
import governanceRuleTemplates from "@/config/governanceRules.json";
import sampleEcosystems from "@/config/sampleEcosystems.json";
import { DEFAULT_SIMULATION_INPUTS } from "@/lib/simulationEngine";

type GovernanceRuleTemplate = {
  id: string;
  title: string;
  description: string;
  category: GovernanceRule["category"];
  defaultOwner: string;
};

const RULE_TEMPLATES = governanceRuleTemplates as GovernanceRuleTemplate[];

function instantiateDefaultRules(ecosystemId: string): GovernanceRule[] {
  return RULE_TEMPLATES.map((r) => ({
    id: r.id,
    ecosystemId,
    title: r.title,
    description: r.description,
    category: r.category,
    active: true,
    owner: r.defaultOwner,
    compliance: 70,
    impact: "Medium" as const,
  }));
}

export interface AppState {
  ecosystems: Ecosystem[];
  actors: Actor[];
  dependencies: Dependency[];
  governanceRules: GovernanceRule[];
  currentEcosystemId: string | null;
  simulationInputs: SimulationInputs;
  assessments: Record<string, AssessmentResult>; // keyed by ecosystemId
  hasSimulated: Record<string, boolean>; // keyed by ecosystemId — framework Step 9 completion
  hasGeneratedReport: Record<string, boolean>; // keyed by ecosystemId — framework Step 10 completion

  // Ecosystem CRUD
  createEcosystem: (data: Omit<Ecosystem, "id" | "dateCreated"> & { dateCreated?: string }) => string;
  updateEcosystem: (id: string, patch: Partial<Ecosystem>) => void;
  deleteEcosystem: (id: string) => void;
  setCurrentEcosystem: (id: string | null) => void;

  // Actor CRUD
  addActor: (actor: Omit<Actor, "id">) => void;
  updateActor: (id: string, patch: Partial<Actor>) => void;
  deleteActor: (id: string) => void;

  // Dependency CRUD
  addDependency: (dep: Omit<Dependency, "id">) => void;
  updateDependency: (id: string, patch: Partial<Dependency>) => void;
  deleteDependency: (id: string) => void;

  // Governance Rules
  updateGovernanceRule: (id: string, patch: Partial<GovernanceRule>) => void;
  toggleGovernanceRule: (id: string) => void;

  // Simulation
  setSimulationInputs: (inputs: SimulationInputs) => void;
  resetSimulation: () => void;

  // Assessment
  saveAssessment: (result: AssessmentResult) => void;

  // Framework step tracking (10-step methodology progress)
  markSimulationRun: (ecosystemId: string) => void;
  markReportGenerated: (ecosystemId: string) => void;

  // Samples
  loadSampleEcosystem: (index: 0 | 1 | 2) => void;

  // Import Wizard
  importBundle: (
    bundle: {
      ecosystem?: Partial<Ecosystem>;
      actors: Partial<Actor>[];
      dependencies: (Partial<Dependency> & { fromActorName?: string; toActorName?: string })[];
      rules: Partial<GovernanceRule>[];
    },
    targetEcosystemId?: string
  ) => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ecosystems: [],
      actors: [],
      dependencies: [],
      governanceRules: [],
      currentEcosystemId: null,
      simulationInputs: DEFAULT_SIMULATION_INPUTS,
      assessments: {},
      hasSimulated: {},
      hasGeneratedReport: {},

      createEcosystem: (data) => {
        const id = uuid();
        const ecosystem: Ecosystem = {
          id,
          dateCreated: data.dateCreated ?? new Date().toISOString().slice(0, 10),
          ...data,
        };
        set((state) => ({
          ecosystems: [...state.ecosystems, ecosystem],
          governanceRules: [...state.governanceRules, ...instantiateDefaultRules(id)],
          currentEcosystemId: id,
        }));
        return id;
      },

      updateEcosystem: (id, patch) =>
        set((state) => ({
          ecosystems: state.ecosystems.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEcosystem: (id) =>
        set((state) => ({
          ecosystems: state.ecosystems.filter((e) => e.id !== id),
          actors: state.actors.filter((a) => a.ecosystemId !== id),
          dependencies: state.dependencies.filter((d) => d.ecosystemId !== id),
          governanceRules: state.governanceRules.filter((r) => r.ecosystemId !== id),
          currentEcosystemId: state.currentEcosystemId === id ? null : state.currentEcosystemId,
        })),

      setCurrentEcosystem: (id) => set({ currentEcosystemId: id }),

      addActor: (actor) => set((state) => ({ actors: [...state.actors, { ...actor, id: uuid() }] })),
      updateActor: (id, patch) =>
        set((state) => ({ actors: state.actors.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      deleteActor: (id) =>
        set((state) => ({
          actors: state.actors.filter((a) => a.id !== id),
          dependencies: state.dependencies.filter((d) => d.fromActorId !== id && d.toActorId !== id),
        })),

      addDependency: (dep) => set((state) => ({ dependencies: [...state.dependencies, { ...dep, id: uuid() }] })),
      updateDependency: (id, patch) =>
        set((state) => ({ dependencies: state.dependencies.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      deleteDependency: (id) => set((state) => ({ dependencies: state.dependencies.filter((d) => d.id !== id) })),

      updateGovernanceRule: (id, patch) =>
        set((state) => ({ governanceRules: state.governanceRules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      toggleGovernanceRule: (id) =>
        set((state) => ({
          governanceRules: state.governanceRules.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
        })),

      setSimulationInputs: (inputs) => set({ simulationInputs: inputs }),
      resetSimulation: () => set({ simulationInputs: DEFAULT_SIMULATION_INPUTS }),

      saveAssessment: (result) =>
        set((state) => ({ assessments: { ...state.assessments, [result.ecosystemId]: result } })),

      markSimulationRun: (ecosystemId) =>
        set((state) => ({ hasSimulated: { ...state.hasSimulated, [ecosystemId]: true } })),
      markReportGenerated: (ecosystemId) =>
        set((state) => ({ hasGeneratedReport: { ...state.hasGeneratedReport, [ecosystemId]: true } })),

      loadSampleEcosystem: (index) => {
        const sample = (sampleEcosystems as any[])[index];
        if (!sample) return;
        // Re-key every id with a fresh uuid to avoid collisions if loaded twice,
        // while preserving internal referential integrity.
        const idMap = new Map<string, string>();
        const ecoId = uuid();
        idMap.set(sample.ecosystem.id, ecoId);

        const actors: Actor[] = sample.actors.map((a: Actor) => {
          const newId = uuid();
          idMap.set(a.id, newId);
          return { ...a, id: newId, ecosystemId: ecoId };
        });

        const dependencies: Dependency[] = sample.dependencies.map((d: Dependency) => ({
          ...d,
          id: uuid(),
          ecosystemId: ecoId,
          fromActorId: idMap.get(d.fromActorId) ?? d.fromActorId,
          toActorId: idMap.get(d.toActorId) ?? d.toActorId,
        }));

        const rules: GovernanceRule[] = sample.governanceRules.map((r: GovernanceRule) => ({
          ...r,
          ecosystemId: ecoId,
        }));

        const ecosystem: Ecosystem = { ...sample.ecosystem, id: ecoId };

        set((state) => ({
          ecosystems: [...state.ecosystems, ecosystem],
          actors: [...state.actors, ...actors],
          dependencies: [...state.dependencies, ...dependencies],
          governanceRules: [...state.governanceRules, ...rules],
          currentEcosystemId: ecoId,
          simulationInputs: DEFAULT_SIMULATION_INPUTS,
        }));
      },

      importBundle: (bundle, targetEcosystemId) => {
        const state = get();
        let ecosystemId = targetEcosystemId ?? state.currentEcosystemId ?? undefined;

        if (!ecosystemId && bundle.ecosystem) {
          ecosystemId = get().createEcosystem({
            name: bundle.ecosystem.name ?? "Imported Ecosystem",
            industry: bundle.ecosystem.industry ?? "",
            country: bundle.ecosystem.country ?? "",
            platform: bundle.ecosystem.platform ?? "",
            description: bundle.ecosystem.description ?? "Imported via the Import Wizard.",
            currentPhase: bundle.ecosystem.currentPhase ?? "Emergence",
            platformType: bundle.ecosystem.platformType ?? "Centralized",
            platformOpenness: bundle.ecosystem.platformOpenness ?? 50,
            numOrganizations: bundle.ecosystem.numOrganizations ?? bundle.actors.length,
          });
        }
        if (!ecosystemId) return "";

        const nameToId = new Map<string, string>();
        const newActors: Actor[] = bundle.actors
          .filter((a) => a.name)
          .map((a) => {
            const id = uuid();
            nameToId.set((a.name as string).trim(), id);
            return {
              id,
              ecosystemId: ecosystemId as string,
              name: a.name as string,
              type: a.type ?? "Manufacturing Provider",
              role: a.role ?? "Capacity Provider",
              authorityLevel: a.authorityLevel ?? 50,
              trustLevel: a.trustLevel ?? 50,
              criticality: a.criticality ?? "Medium",
              platformMember: a.platformMember ?? false,
              country: a.country ?? "",
              capabilities: a.capabilities ?? [],
              resources: a.resources ?? [],
              status: a.status ?? "Onboarding",
            };
          });

        const newDependencies: Dependency[] = bundle.dependencies
          .map((d) => {
            const fromId = d.fromActorId ?? (d.fromActorName ? nameToId.get(d.fromActorName.trim()) : undefined);
            const toId = d.toActorId ?? (d.toActorName ? nameToId.get(d.toActorName.trim()) : undefined);
            if (!fromId || !toId) return null;
            return {
              id: uuid(),
              ecosystemId: ecosystemId as string,
              fromActorId: fromId,
              toActorId: toId,
              dependencyType: d.dependencyType ?? "Service",
              strength: d.strength ?? 50,
              ruleId: d.ruleId ?? null,
              criticality: d.criticality ?? "Medium",
              status: d.status ?? "Active",
            } as Dependency;
          })
          .filter((d): d is Dependency => d !== null);

        set((s) => {
          let governanceRules = s.governanceRules;
          for (const r of bundle.rules) {
            if (!r.id) continue;
            const existingIdx = governanceRules.findIndex((rule) => rule.ecosystemId === ecosystemId && rule.id === r.id);
            if (existingIdx >= 0) {
              governanceRules = governanceRules.map((rule, i) => (i === existingIdx ? { ...rule, ...r } : rule));
            }
          }
          return {
            actors: [...s.actors, ...newActors],
            dependencies: [...s.dependencies, ...newDependencies],
            governanceRules,
          };
        });

        return ecosystemId;
      },
    }),
    {
      name: "gdss-storage",
      version: 2,
    }
  )
);

// --- Convenience selectors -----------------------------------------------

export function useCurrentEcosystem() {
  return useAppStore((s) => s.ecosystems.find((e) => e.id === s.currentEcosystemId) ?? null);
}

export function useCurrentActors() {
  return useAppStore((s) => s.actors.filter((a) => a.ecosystemId === s.currentEcosystemId));
}

export function useCurrentDependencies() {
  return useAppStore((s) => s.dependencies.filter((d) => d.ecosystemId === s.currentEcosystemId));
}

export function useCurrentGovernanceRules() {
  return useAppStore((s) => s.governanceRules.filter((r) => r.ecosystemId === s.currentEcosystemId));
}
