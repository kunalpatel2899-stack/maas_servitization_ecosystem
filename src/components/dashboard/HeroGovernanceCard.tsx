"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { ShieldCheck, GaugeCircle, GitCommitVertical, TrendingUp, TrendingDown } from "lucide-react";
import type { LifecyclePhaseName, PhaseGate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tooltip as InfoTooltip } from "@/components/ui/Tooltip";
import { Info } from "lucide-react";

const statusStyles: Record<string, { text: string; bg: string; ring: string }> = {
  Healthy: { text: "text-status-healthy", bg: "bg-status-healthy/10", ring: "ring-status-healthy/25" },
  "At Risk": { text: "text-status-warning", bg: "bg-status-warning/10", ring: "ring-status-warning/25" },
  Critical: { text: "text-status-critical", bg: "bg-status-critical/10", ring: "ring-status-critical/25" },
};

const gateStyles: Record<PhaseGate, string> = {
  PASS: "text-status-healthy bg-status-healthy/10 border-status-healthy/30",
  HOLD: "text-status-warning bg-status-warning/10 border-status-warning/30",
  FAIL: "text-status-critical bg-status-critical/10 border-status-critical/30",
};

export function HeroGovernanceCard({
  rogma,
  health,
  phase,
  phaseGate,
  history,
  ecosystemName,
}: {
  rogma: number;
  health: "Healthy" | "At Risk" | "Critical";
  phase: LifecyclePhaseName;
  phaseGate: PhaseGate;
  history: number[];
  ecosystemName: string;
}) {
  const s = statusStyles[health];
  const trendPct = history.length >= 2 ? Math.round((history[history.length - 1] - history[history.length - 2]) * 10) / 10 : 0;
  const TrendIcon = trendPct >= 0 ? TrendingUp : TrendingDown;
  const chartData = history.map((v, i) => ({ i, value: v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl2 border border-surface-border bg-white shadow-lifted"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-blue/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-brand-teal/5 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-8 p-7 lg:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center gap-5">
          <div className={cn("flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ring-4", s.bg, s.ring)}>
            <GaugeCircle className={cn("h-9 w-9", s.text)} />
          </div>
          <div>
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
              {ecosystemName} · ROGMA Score
              <InfoTooltip text="Resilience-Oriented Governance Maturity Assessment — a weighted composite of all 10 governance KPIs, 0-100.">
                <Info size={11} className="text-ink-300" />
              </InfoTooltip>
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-gradient-blue text-5xl font-extrabold tracking-tight">{rogma.toFixed(1)}</span>
              <span className={cn("flex items-center gap-0.5 text-sm font-semibold", trendPct >= 0 ? "text-status-healthy" : "text-status-critical")}>
                <TrendIcon size={14} />
                {Math.abs(trendPct)}%
              </span>
            </div>
            <span className={cn("mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", s.bg, s.text)}>
              <ShieldCheck size={12} /> {health}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-400">Quarterly Trend</p>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="rogmaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B5FFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0B5FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E9F0", borderRadius: 8, fontSize: 12 }} labelFormatter={() => ""} />
                <Area type="monotone" dataKey="value" stroke="#0B5FFF" strokeWidth={2} fill="url(#rogmaFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 lg:items-end lg:text-right">
          <div>
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-ink-400 lg:justify-end">
              Current Lifecycle Phase
              <InfoTooltip text="One of Emergence, Growth, Maturity or Evolution — each phase has its own governance criteria and KPI thresholds.">
                <Info size={11} className="text-ink-300" />
              </InfoTooltip>
            </p>
            <p className="flex items-center gap-2 text-lg font-bold text-ink-900 lg:justify-end">
              <GitCommitVertical size={18} className="text-brand-blue" />
              {phase} Phase
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-ink-400 lg:justify-end">
              Phase Gate
              <InfoTooltip text="PASS: ready to advance. HOLD: some KPIs below threshold. FAIL: critical governance gaps block advancement.">
                <Info size={11} className="text-ink-300" />
              </InfoTooltip>
            </p>
            <span className={cn("inline-flex items-center rounded-lg border px-3 py-1 font-mono text-sm font-bold tracking-wider", gateStyles[phaseGate])}>
              {phaseGate}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
