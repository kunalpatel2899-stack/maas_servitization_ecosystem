import type { Actor } from "./types";

// Deterministic layout: the highest-authority Platform-category actor is
// pinned to the canvas center; every other actor is arranged on a circle
// around it, grouped by type category so related actors sit near each
// other. Avoids a full graph-layout dependency while producing a legible
// hub-and-spoke topology typical of platform ecosystems.
export function computeNodePositions(actors: Actor[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  if (actors.length === 0) return positions;

  const center = [...actors].sort((a, b) => b.authorityLevel - a.authorityLevel)[0];
  const centerX = 560;
  const centerY = 380;
  positions[center.id] = { x: centerX, y: centerY };

  const rest = actors.filter((a) => a.id !== center.id);

  const categoryOrder = [
    "Regulator", "Standards Body", "Industry Association",
    "Platform Operator", "Marketplace", "Data Platform", "Technology Provider",
    "OEM", "Manufacturing Provider", "Customer",
    "MRO", "Logistics", "Recycler", "Financial Provider", "Insurance Provider", "Workforce Provider",
    "Auditor", "Security Provider", "Certification Body",
  ];
  const sorted = [...rest].sort(
    (a, b) => categoryOrder.indexOf(a.type) - categoryOrder.indexOf(b.type)
  );

  const radiusBase = 300;
  sorted.forEach((actor, i) => {
    const angle = (i / sorted.length) * Math.PI * 2 - Math.PI / 2;
    const radius = radiusBase - actor.authorityLevel * 0.9;
    positions[actor.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle) * 0.82,
    };
  });

  return positions;
}

/** Maps an actor's status/criticality to a network risk color tier. */
export function actorRiskLevel(actor: Actor): "healthy" | "warning" | "critical" {
  if (actor.status === "Exited" || actor.status === "Inactive") return "critical";
  if (actor.criticality === "Critical") return actor.status === "Onboarding" ? "warning" : "critical";
  if (actor.criticality === "High" || actor.status === "Onboarding") return "warning";
  return "healthy";
}
