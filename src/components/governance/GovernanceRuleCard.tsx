"use client";

import { motion } from "framer-motion";
import type { Criticality, GovernanceRule } from "@/lib/types";
import { Toggle } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const impactColor: Record<Criticality, string> = {
  Low: "text-status-healthy bg-status-healthy/10",
  Medium: "text-status-warning bg-status-warning/10",
  High: "text-orange-600 bg-orange-500/10",
  Critical: "text-status-critical bg-status-critical/10",
};

export function GovernanceRuleCard({
  rule,
  index = 0,
  onUpdate,
}: {
  rule: GovernanceRule;
  index?: number;
  onUpdate: (patch: Partial<GovernanceRule>) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "rounded-lg border bg-white p-4 shadow-card",
        rule.active ? "border-surface-borderLight" : "border-status-critical/25 bg-status-critical/[0.03]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-blueLight px-2 py-0.5 font-mono text-[11px] font-bold text-brand-blue">{rule.id}</span>
            <p className="truncate text-sm font-semibold text-ink-900">{rule.title}</p>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{rule.description}</p>
        </div>
        <Toggle checked={rule.active} onChange={(v) => onUpdate({ active: v })} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-400">Owner</label>
          <Input value={rule.owner} onChange={(e) => onUpdate({ owner: e.target.value })} className="py-1.5 text-[12px]" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-400">Impact</label>
          <Select value={rule.impact} onChange={(e) => onUpdate({ impact: e.target.value as Criticality })} className="py-1.5 text-[12px]">
            {(["Low", "Medium", "High", "Critical"] as Criticality[]).map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div className="col-span-2">
          <label className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-ink-400">
            Compliance <span className="font-mono text-[11px] text-ink-700">{rule.compliance}%</span>
          </label>
          <input
            type="range" min={0} max={100} value={rule.compliance}
            onChange={(e) => onUpdate({ compliance: Number(e.target.value) })}
            disabled={!rule.active}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full disabled:opacity-40 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-teal [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            style={{ background: `linear-gradient(to right, #2DC6D6 ${rule.compliance}%, #E5E9F0 ${rule.compliance}%)` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md bg-surface-panelAlt px-2 py-0.5 text-[11px] font-medium text-ink-500">{rule.category}</span>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${impactColor[rule.impact]}`}>{rule.impact} Impact</span>
        <span className={cn("ml-auto text-[11px] font-semibold", rule.active ? "text-status-healthy" : "text-status-critical")}>
          {rule.active ? "Active" : "Inactive"}
        </span>
      </div>
    </motion.div>
  );
}
