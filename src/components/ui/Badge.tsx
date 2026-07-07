import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const severityStyles: Record<string, string> = {
  Low: "bg-status-healthy/10 text-status-healthy border-status-healthy/25",
  Medium: "bg-status-warning/10 text-status-warning border-status-warning/25",
  High: "bg-orange-500/10 text-orange-600 border-orange-500/25",
  Critical: "bg-status-critical/10 text-status-critical border-status-critical/25",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        severityStyles[severity] ?? "bg-ink-400/10 text-ink-500 border-ink-400/25"
      )}
    >
      {severity}
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-surface-borderLight bg-surface-panelAlt px-2 py-0.5 text-[11px] font-medium text-ink-700",
        className
      )}
    >
      {children}
    </span>
  );
}
