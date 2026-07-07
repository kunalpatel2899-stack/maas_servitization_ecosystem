import { riskColor } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

export function StatusDot({ level, size = 8 }: { level: RiskLevel; size?: number }) {
  const color = riskColor[level];
  return (
    <span
      className="inline-block rounded-full animate-pulseSlow"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 6px 1px ${color}66`,
      }}
    />
  );
}
