import { cn, riskColor } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

export function Progress({
  value,
  max = 100,
  status = "healthy",
  className,
}: {
  value: number;
  max?: number;
  status?: RiskLevel;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-panelAlt", className)}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, backgroundColor: riskColor[status] }}
      />
    </div>
  );
}
