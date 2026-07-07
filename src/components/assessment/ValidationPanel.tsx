"use client";

import { CheckCircle2, ShieldQuestion, AlertCircle, Info } from "lucide-react";
import type { ValidationResult } from "@/lib/validationEngine";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Tooltip } from "@/components/ui/Tooltip";

function scoreStatus(v: number): "healthy" | "warning" | "critical" {
  if (v >= 75) return "healthy";
  if (v >= 50) return "warning";
  return "critical";
}

export function ValidationPanel({ result }: { result: ValidationResult }) {
  const ready = result.status === "Assessment Ready";
  const metrics = [
    { label: "Governance Completeness", value: result.governanceCompleteness, tip: "Share of the G1-G14 governance rule catalog that is configured with an owner and active status." },
    { label: "Actor Completeness", value: result.actorCompleteness, tip: "Share of registered actors with complete required fields (name, role, country, capabilities, resources) plus presence of key actor types." },
    { label: "Dependency Completeness", value: result.dependencyCompleteness, tip: "Share of actors that are connected by at least one dependency — isolated actors reduce this score." },
    { label: "Data Quality", value: result.dataQuality, tip: "Penalizes detected anomalies: duplicate actor names, self-loop dependencies, and dependencies referencing missing actors." },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldQuestion size={15} className="text-brand-blue" /> Governance Validation
          </CardTitle>
          <CardSubtitle>Checks data sufficiency before a scientifically meaningful assessment can be run</CardSubtitle>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            ready ? "bg-status-healthy/10 text-status-healthy" : "bg-status-critical/10 text-status-critical"
          }`}
        >
          {ready ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          {result.status}
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-surface-borderLight bg-surface-panelAlt/50 p-3.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {m.label}
                <Tooltip text={m.tip}>
                  <Info size={10} className="text-ink-300" />
                </Tooltip>
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink-900">{m.value}%</p>
              <Progress value={m.value} status={scoreStatus(m.value)} className="mt-2 h-1.5" />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-blueLight/50 px-4 py-3">
          <span className="flex items-center gap-1 text-[12px] font-semibold text-ink-700">
            Overall Confidence
            <Tooltip text="Average of the four completeness scores above — the platform's own estimate of how trustworthy an assessment result would be.">
              <Info size={11} className="text-brand-blue/60" />
            </Tooltip>
          </span>
          <span className="font-mono text-lg font-extrabold text-brand-blue">{result.confidence}%</span>
        </div>

        {result.missingInfo.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Missing / Flagged Information</p>
            <ul className="space-y-1.5">
              {result.missingInfo.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px] text-ink-600">
                  <AlertCircle size={13} className="mt-0.5 shrink-0 text-status-warning" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
