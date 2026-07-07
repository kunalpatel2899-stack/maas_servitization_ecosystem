import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Maps a risk/status level to consistent color tokens used across the UI
// (traffic lights, edges, badges, progress bars) — tuned for a light background.
export const riskColor: Record<RiskLevel, string> = {
  healthy: "#1FA97A",
  warning: "#DB9200",
  critical: "#E5484D",
};

export const riskTextClass: Record<RiskLevel, string> = {
  healthy: "text-status-healthy",
  warning: "text-status-warning",
  critical: "text-status-critical",
};

export const riskBgClass: Record<RiskLevel, string> = {
  healthy: "bg-status-healthy/10",
  warning: "bg-status-warning/10",
  critical: "bg-status-critical/10",
};

export const riskBorderClass: Record<RiskLevel, string> = {
  healthy: "border-status-healthy/30",
  warning: "border-status-warning/30",
  critical: "border-status-critical/30",
};

export function severityRank(sev: string): number {
  switch (sev) {
    case "Critical": return 4;
    case "High": return 3;
    case "Medium": return 2;
    case "Low": return 1;
    default: return 0;
  }
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(/\.0$/, "");
}
