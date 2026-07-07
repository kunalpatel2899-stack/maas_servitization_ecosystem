"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { KPI } from "@/lib/types";
import { cn, riskBorderClass } from "@/lib/utils";
import { Sparkline } from "@/components/ui/Sparkline";
import { Progress } from "@/components/ui/Progress";
import { StatusDot } from "@/components/ui/StatusDot";

const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus };

export function KPICard({ kpi, index = 0, onExplain }: { kpi: KPI; index?: number; onExplain?: (kpi: KPI) => void }) {
  const Icon = trendIcon[kpi.trend];
  const trendIsGood = kpi.lowerIsBetter ? kpi.trend === "down" : kpi.trend === "up";
  const sparkColor = kpi.status === "critical" ? "#E5484D" : kpi.status === "warning" ? "#DB9200" : "#0B5FFF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: "easeOut" }}
      className={cn(
        "group relative rounded-xl2 border bg-white p-4 shadow-card transition-transform hover:-translate-y-0.5",
        riskBorderClass[kpi.status]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink-900">{kpi.shortName}</p>
          <p className="mt-0.5 text-[11px] text-ink-400">Target {kpi.target}{kpi.unit === "%" ? "%" : ""}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {onExplain && (
            <button
              onClick={() => onExplain(kpi)}
              title="Explain this KPI"
              className="rounded-md p-1 text-ink-300 hover:bg-brand-blueLight hover:text-brand-blue"
            >
              <Info size={14} />
            </button>
          )}
          <StatusDot level={kpi.status} />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-ink-900">{kpi.current}</span>
          <span className="text-xs text-ink-400">{kpi.unit === "%" ? "%" : "/100"}</span>
        </div>
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
            trendIsGood ? "text-status-healthy bg-status-healthy/10" : "text-status-critical bg-status-critical/10"
          )}
        >
          <Icon size={12} />
          {Math.abs(kpi.changePct)}%
        </span>
      </div>

      <div className="mt-3">
        <Progress value={kpi.current} max={100} status={kpi.status} />
      </div>

      <div className="mt-3">
        <Sparkline data={kpi.history} color={sparkColor} />
      </div>

      <div className="mt-2 rounded-md bg-surface-panelAlt px-2 py-1 text-[11px] leading-snug text-ink-500">
        {kpi.description}
      </div>

      {onExplain && (
        <button
          onClick={() => onExplain(kpi)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-surface-borderLight py-1.5 text-[11px] font-medium text-brand-blue hover:bg-brand-blueLight"
        >
          <Info size={12} /> Explain
        </button>
      )}
    </motion.div>
  );
}
