"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Actor, Dependency } from "@/lib/types";
import { DependencyActorNode } from "./DependencyActorNode";
import { computeNodePositions, actorRiskLevel } from "@/lib/networkLayout";
import { riskColor } from "@/lib/utils";

const nodeTypes = { actor: DependencyActorNode };

export function DependencyGraph({
  actors,
  dependencies,
  onConnect,
  onEdgeClick,
  onNodeClick,
  height = 560,
}: {
  actors: Actor[];
  dependencies: Dependency[];
  onConnect?: (c: Connection) => void;
  onEdgeClick?: (dependencyId: string) => void;
  onNodeClick?: (actor: Actor) => void;
  height?: number;
}) {
  const positions = useMemo(() => computeNodePositions(actors), [actors]);

  const nodes: Node[] = useMemo(
    () =>
      actors.map((actor) => ({
        id: actor.id,
        type: "actor",
        position: positions[actor.id] ?? { x: 0, y: 0 },
        data: actor,
        draggable: true,
      })),
    [actors, positions]
  );

  const edgeRiskFor = (dep: Dependency): "healthy" | "warning" | "critical" => {
    if (dep.status === "Broken") return "critical";
    if (dep.status === "At Risk") return "warning";
    if (dep.criticality === "Critical") return "warning";
    return "healthy";
  };

  const edges: Edge[] = useMemo(
    () =>
      dependencies.map((d) => ({
        id: d.id,
        source: d.fromActorId,
        target: d.toActorId,
        animated: d.status === "Broken",
        style: {
          stroke: riskColor[edgeRiskFor(d)],
          strokeWidth: 1 + d.strength / 22,
          opacity: 0.85,
        },
        label: d.ruleId ?? undefined,
        labelStyle: { fill: "#5B6472", fontSize: 10 },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.85 },
      })),
    [dependencies]
  );

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-surface-border bg-surface-panelAlt/40" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onEdgeClick={(_, edge) => onEdgeClick?.(edge.id)}
        onNodeClick={(_, node) => onNodeClick?.(node.data as Actor)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.6}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#dfe4ec" />
        <Controls showInteractive={false} className="!border !border-surface-border !bg-white !text-ink-700 !shadow-card" />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(244,246,250,0.75)"
          nodeColor={(n) => riskColor[actorRiskLevel(n.data as Actor)]}
          className="!border !border-surface-border !bg-white"
        />
      </ReactFlow>
    </div>
  );
}
