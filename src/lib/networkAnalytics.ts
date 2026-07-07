// Advanced Network Analytics — turns the dependency graph from a picture
// into an analytical instrument: centrality, density, connectivity,
// single-point-of-failure detection and an actor importance ranking.

import type { Actor, Dependency } from "./types";

export interface ActorImportance {
  actorId: string;
  name: string;
  weightedDegree: number; // sum of incoming + outgoing dependency strength
  degreeCount: number; // number of distinct dependency links touching this actor
  rank: number;
}

export interface NetworkAnalytics {
  mostCentralActor: ActorImportance | null;
  highestDependency: { from: string; to: string; strength: number; type: string } | null;
  singlePointsOfFailure: ActorImportance[];
  networkDensity: number; // % of all possible directed edges that exist
  avgConnectivity: number; // average degree per actor
  criticalDependencies: Dependency[];
  hotspots: ActorImportance[]; // actors with unusually high degree count
  importanceRanking: ActorImportance[];
}

export function computeNetworkAnalytics(actors: Actor[], dependencies: Dependency[]): NetworkAnalytics {
  const nameOf = (id: string) => actors.find((a) => a.id === id)?.name ?? id;

  const weighted = new Map<string, number>();
  const degreeCount = new Map<string, number>();
  for (const a of actors) {
    weighted.set(a.id, 0);
    degreeCount.set(a.id, 0);
  }
  for (const d of dependencies) {
    weighted.set(d.toActorId, (weighted.get(d.toActorId) ?? 0) + d.strength);
    weighted.set(d.fromActorId, (weighted.get(d.fromActorId) ?? 0) + d.strength * 0.5);
    degreeCount.set(d.toActorId, (degreeCount.get(d.toActorId) ?? 0) + 1);
    degreeCount.set(d.fromActorId, (degreeCount.get(d.fromActorId) ?? 0) + 1);
  }

  const importanceRanking: ActorImportance[] = actors
    .map((a) => ({
      actorId: a.id,
      name: a.name,
      weightedDegree: Math.round((weighted.get(a.id) ?? 0) * 10) / 10,
      degreeCount: degreeCount.get(a.id) ?? 0,
    }))
    .sort((a, b) => b.weightedDegree - a.weightedDegree)
    .map((a, i) => ({ ...a, rank: i + 1 }));

  const mostCentralActor = importanceRanking[0] ?? null;

  const highestDep = [...dependencies].sort((a, b) => b.strength - a.strength)[0];
  const highestDependency = highestDep
    ? { from: nameOf(highestDep.fromActorId), to: nameOf(highestDep.toActorId), strength: highestDep.strength, type: highestDep.dependencyType }
    : null;

  const n = actors.length;
  const maxPossibleEdges = n > 1 ? n * (n - 1) : 1;
  const networkDensity = Math.round((dependencies.length / maxPossibleEdges) * 1000) / 10;
  const avgConnectivity = n > 0 ? Math.round(((dependencies.length * 2) / n) * 10) / 10 : 0;

  const totalWeighted = importanceRanking.reduce((s, a) => s + a.weightedDegree, 0) || 1;
  const singlePointsOfFailure = importanceRanking
    .filter((a) => (a.weightedDegree / totalWeighted) * 100 > 30)
    .filter((a) => {
      const actor = actors.find((x) => x.id === a.actorId);
      return actor && (actor.criticality === "High" || actor.criticality === "Critical");
    })
    .slice(0, 3);

  const criticalDependencies = dependencies.filter((d) => d.criticality === "Critical" || d.criticality === "High");

  const avgDegree = importanceRanking.length > 0 ? importanceRanking.reduce((s, a) => s + a.degreeCount, 0) / importanceRanking.length : 0;
  const hotspots = importanceRanking.filter((a) => a.degreeCount > avgDegree * 1.4).slice(0, 5);

  return {
    mostCentralActor,
    highestDependency,
    singlePointsOfFailure,
    networkDensity,
    avgConnectivity,
    criticalDependencies,
    hotspots,
    importanceRanking,
  };
}
