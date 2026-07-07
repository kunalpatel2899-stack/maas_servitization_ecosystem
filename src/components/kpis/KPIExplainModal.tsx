"use client";

import { BookOpen, Calculator, Database, Percent, Lightbulb, FlaskConical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { Actor, Dependency, Ecosystem, GovernanceRule, KPI } from "@/lib/types";
import kpiScience from "@/config/kpiScience.json";
import { explainKPI } from "@/lib/kpiExplain";
import { StatusDot } from "@/components/ui/StatusDot";

type Science = {
  purpose: string;
  formulaText: string;
  variables: { symbol: string; meaning: string }[];
  source: string;
};

export function KPIExplainModal({
  kpi,
  allKpis,
  ctx,
  open,
  onClose,
}: {
  kpi: KPI | null;
  allKpis: KPI[];
  ctx: { ecosystem: Ecosystem; actors: Actor[]; dependencies: Dependency[]; rules: GovernanceRule[] };
  open: boolean;
  onClose: () => void;
}) {
  if (!kpi) return null;
  const science = (kpiScience as Record<string, Science>)[kpi.id];
  const explanation = explainKPI(kpi, ctx, allKpis);

  return (
    <Modal open={open} onClose={onClose} title={`Explain: ${kpi.name}`} width="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-panelAlt/60 p-4">
          <StatusDot level={kpi.status} size={10} />
          <div>
            <p className="text-2xl font-extrabold text-ink-900">{kpi.current}{kpi.unit === "%" ? "%" : ""}</p>
            <p className="text-[11px] text-ink-500">Target {kpi.target}{kpi.unit === "%" ? "%" : ""} · Threshold {kpi.threshold}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Contribution to ROGMA</p>
            <p className="text-lg font-bold text-brand-blue">{explanation.contributionPct}%</p>
          </div>
        </div>

        <Section icon={<BookOpen size={14} />} title="Definition & Purpose">
          <p className="text-[13px] leading-relaxed text-ink-700">{science?.purpose ?? kpi.description}</p>
        </Section>

        <Section icon={<Calculator size={14} />} title="Formula">
          <p className="rounded-md bg-surface-panelAlt px-3 py-2 font-mono text-[12px] text-ink-800">{science?.formulaText ?? "Not documented"}</p>
          {science?.variables && science.variables.length > 0 && (
            <ul className="mt-2 space-y-1">
              {science.variables.map((v) => (
                <li key={v.symbol} className="text-[12px] text-ink-600">
                  <span className="font-mono font-semibold text-ink-800">{v.symbol}</span> — {v.meaning}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<FlaskConical size={14} />} title="Scientific Source">
          <p className="text-[12px] italic leading-relaxed text-ink-500">{science?.source ?? "Not yet documented — add your literature citation here."}</p>
        </Section>

        <Section icon={<Database size={14} />} title="Current Input Values">
          <div className="grid grid-cols-2 gap-2">
            {explanation.currentInputs.map((i) => (
              <div key={i.label} className="rounded-md border border-surface-borderLight bg-white p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{i.label}</p>
                <p className="font-mono text-sm font-bold text-ink-900">{i.value}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<Lightbulb size={14} />} title="Why This Result">
          <ul className="space-y-1.5">
            {explanation.reasoning.map((r, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-ink-700">• {r}</li>
            ))}
          </ul>
        </Section>

        <Section icon={<Percent size={14} />} title="Calculation Steps">
          <ol className="list-decimal space-y-1 pl-4">
            <li className="text-[12px] text-ink-600">Gather current input values from live ecosystem state (above).</li>
            <li className="text-[12px] text-ink-600">Apply the formula shown above to produce the raw KPI value.</li>
            <li className="text-[12px] text-ink-600">
              Normalize {kpi.lowerIsBetter ? "(100 − value, since lower is better for this KPI)" : "(value as-is, since higher is better)"} for ROGMA aggregation.
            </li>
            <li className="text-[12px] text-ink-600">Weight by {kpi.weight} and divide by the sum of all KPI weights to obtain the {explanation.contributionPct}% contribution shown above.</li>
          </ol>
        </Section>
      </div>
    </Modal>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}
