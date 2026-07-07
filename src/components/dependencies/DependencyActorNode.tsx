"use client";

import { Handle, Position } from "reactflow";
import type { Actor } from "@/lib/types";
import { riskColor } from "@/lib/utils";
import { actorRiskLevel } from "@/lib/networkLayout";

// Custom React Flow node for the Dependency Mapping canvas. Diameter scales
// with authority level; border/glow color encodes derived risk level.
export function DependencyActorNode({ data }: { data: Actor }) {
  const size = 44 + (data.authorityLevel / 100) * 44;
  const level = actorRiskLevel(data);
  const color = riskColor[level];

  return (
    <div
      className="flex flex-col items-center justify-center rounded-full bg-white text-center shadow-card transition-all duration-500"
      style={{
        width: size,
        height: size,
        border: `2.5px solid ${color}`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <span className="px-1 font-semibold leading-tight text-ink-800" style={{ fontSize: size > 70 ? 10.5 : 9 }}>
        {data.name}
      </span>
    </div>
  );
}
