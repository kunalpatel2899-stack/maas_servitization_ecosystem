"use client";

import { useMemo } from "react";
import { FileBarChart, FileText, FileSpreadsheet, FileDown } from "lucide-react";
import {
  useAppStore,
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { exportPDF, exportExcel, exportCSV, type ReportContext } from "@/lib/reportGenerator";
import { calculateKPIs } from "@/lib/kpiEngine";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import type { KPIDefinition } from "@/lib/types";

function ReportsContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const assessment = useAppStore((s) => s.assessments[ecosystem.id] ?? null);
  const hasSimulated = useAppStore((s) => !!s.hasSimulated[ecosystem.id]);
  const hasGeneratedReport = useAppStore((s) => !!s.hasGeneratedReport[ecosystem.id]);
  const markReportGenerated = useAppStore((s) => s.markReportGenerated);

  const kpis = useMemo(
    () => calculateKPIs({ ecosystem, actors, dependencies, rules }, kpiDefinitions as KPIDefinition[]),
    [ecosystem, actors, dependencies, rules]
  );

  const ctx: ReportContext = {
    ecosystem,
    actors,
    dependencies,
    rules,
    assessment,
    frameworkCtx: { ecosystem, actors, dependencies, rules, kpis, assessment, hasSimulated, hasGeneratedReport },
  };

  const handleExport = (fn: (c: ReportContext) => void) => {
    fn(ctx);
    markReportGenerated(ecosystem.id);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart size={15} className="text-brand-blue" /> Governance Assessment Report — {ecosystem.name}
            </CardTitle>
            <CardSubtitle>
              Step 10 of the ROGF methodology. Exports a consulting-grade report: executive summary, framework
              progress, ecosystem/actor/dependency/rule inventories, ROGMA &amp; KPI breakdown, risk matrix, network
              analytics, lifecycle readiness and decision-support recommendations.
            </CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          {!assessment && (
            <div className="mb-4 rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-[12px] text-ink-700">
              No ROGMA Assessment has been run yet for this ecosystem — reports will still include ecosystem, actor, dependency and
              governance rule data, but ROGMA/KPI/risk/recommendation sections will be empty. Run one from the ROGMA Assessment module for a complete report.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button onClick={() => handleExport(exportPDF)} className="flex flex-col items-center gap-2 rounded-lg border border-surface-borderLight bg-surface-panelAlt/50 p-5 hover:border-brand-blue/40 hover:bg-brand-blueLight/40">
              <FileText size={24} className="text-brand-blue" />
              <span className="text-sm font-semibold text-ink-900">Export PDF</span>
              <span className="text-[11px] text-ink-500">Consulting-grade governance report</span>
            </button>
            <button onClick={() => handleExport(exportExcel)} className="flex flex-col items-center gap-2 rounded-lg border border-surface-borderLight bg-surface-panelAlt/50 p-5 hover:border-brand-blue/40 hover:bg-brand-blueLight/40">
              <FileSpreadsheet size={24} className="text-brand-teal" />
              <span className="text-sm font-semibold text-ink-900">Export Excel</span>
              <span className="text-[11px] text-ink-500">Multi-sheet workbook (.xlsx)</span>
            </button>
            <button onClick={() => handleExport(exportCSV)} className="flex flex-col items-center gap-2 rounded-lg border border-surface-borderLight bg-surface-panelAlt/50 p-5 hover:border-brand-blue/40 hover:bg-brand-blueLight/40">
              <FileDown size={24} className="text-status-warning" />
              <span className="text-sm font-semibold text-ink-900">Export CSV</span>
              <span className="text-[11px] text-ink-500">Flat sectioned data export</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Contents Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="Actors" value={actors.length} />
            <SummaryStat label="Dependencies" value={dependencies.length} />
            <SummaryStat label="Governance Rules" value={rules.length} />
            <SummaryStat label="ROGMA" value={assessment ? assessment.rogma.toFixed(1) : "—"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Executive Summary</Badge>
            <Badge>Framework Overview</Badge>
            <Badge>Ecosystem Information</Badge>
            <Badge>Actor Inventory</Badge>
            <Badge>Dependency Analysis</Badge>
            <Badge>Governance Rules</Badge>
            <Badge>Network Analytics</Badge>
            {assessment && <Badge>ROGMA &amp; KPI Table</Badge>}
            {assessment && <Badge>Risk Matrix</Badge>}
            {assessment && <Badge>Recommendations</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-panelAlt/50 p-3.5 text-center">
      <p className="text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-ink-500">{label}</p>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <RequireEcosystem>
      <ReportsContent />
    </RequireEcosystem>
  );
}
