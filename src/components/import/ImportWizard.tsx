"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileJson, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import {
  parseJSONImport,
  parseCSVImport,
  parseExcelImport,
  validateImportBundle,
  type ImportBundle,
  type ImportValidation,
} from "@/lib/importParser";
import { toast } from "@/lib/toast";

export function ImportWizard() {
  const router = useRouter();
  const importBundle = useAppStore((s) => s.importBundle);
  const currentEcosystemId = useAppStore((s) => s.currentEcosystemId);

  const [bundle, setBundle] = useState<ImportBundle | null>(null);
  const [validation, setValidation] = useState<ImportValidation | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  const handleFile = async (file: File) => {
    setParseError(null);
    setImported(false);
    setFileName(file.name);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let parsed: ImportBundle;
      if (ext === "json") {
        parsed = parseJSONImport(await file.text());
      } else if (ext === "csv") {
        parsed = parseCSVImport(await file.text());
      } else if (ext === "xlsx" || ext === "xls") {
        parsed = parseExcelImport(await file.arrayBuffer());
      } else {
        throw new Error("Unsupported file type — please use .json, .csv or .xlsx.");
      }
      setBundle(parsed);
      setValidation(validateImportBundle(parsed));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse file.";
      setParseError(message);
      setBundle(null);
      setValidation(null);
      toast.error(message);
    }
  };

  const handleImport = () => {
    if (!bundle) return;
    const ecoId = importBundle(bundle, currentEcosystemId ?? undefined);
    setImported(true);
    toast.success(
      `Imported ${validation?.recordCounts.actors ?? 0} actor(s), ${validation?.recordCounts.dependencies ?? 0} dependenc${
        (validation?.recordCounts.dependencies ?? 0) === 1 ? "y" : "ies"
      } and ${validation?.recordCounts.rules ?? 0} rule override(s).`
    );
    if (ecoId) {
      setTimeout(() => router.push("/actors"), 900);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud size={15} className="text-brand-blue" /> Import Ecosystem Data
            </CardTitle>
            <CardSubtitle>Populate actors, dependencies and governance rules from Excel, CSV or JSON — no manual entry required</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-surface-borderLight bg-surface-panelAlt/40 px-6 py-10 text-center hover:border-brand-blue/40 hover:bg-brand-blueLight/20">
            <div className="flex gap-2 text-ink-300">
              <FileJson size={22} />
              <FileSpreadsheet size={22} />
              <FileText size={22} />
            </div>
            <p className="text-sm font-semibold text-ink-800">{fileName ?? "Click to choose a file, or drag it here"}</p>
            <p className="text-[11px] text-ink-400">Supported: .json (full ecosystem bundle) · .csv (actor table) · .xlsx (Actors / Dependencies / GovernanceRules sheets)</p>
            <input
              type="file"
              accept=".json,.csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>

          {parseError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-status-critical/30 bg-status-critical/10 px-4 py-3 text-[12px] text-status-critical">
              <XCircle size={14} /> {parseError}
            </div>
          )}
        </CardContent>
      </Card>

      {validation && bundle && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Import Preview</CardTitle>
              <CardSubtitle>Review detected records and validation results before importing</CardSubtitle>
            </div>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                validation.status === "Ready to Import" ? "bg-status-healthy/10 text-status-healthy" : "bg-status-critical/10 text-status-critical"
              }`}
            >
              {validation.status === "Ready to Import" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {validation.status}
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Actors" value={validation.recordCounts.actors} />
              <Stat label="Dependencies" value={validation.recordCounts.dependencies} />
              <Stat label="Governance Rules" value={validation.recordCounts.rules} />
            </div>

            {validation.errors.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-status-critical">
                  <XCircle size={12} /> Detected Errors ({validation.errors.length})
                </p>
                <ul className="space-y-1">
                  {validation.errors.map((e, i) => <li key={i} className="text-[12px] text-ink-600">• {e}</li>)}
                </ul>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-status-warning">
                  <AlertTriangle size={12} /> Warnings / Missing Fields ({validation.warnings.length})
                </p>
                <ul className="space-y-1">
                  {validation.warnings.map((w, i) => <li key={i} className="text-[12px] text-ink-600">• {w}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3 border-t border-surface-border pt-4">
              <Button variant="primary" onClick={handleImport} disabled={validation.status === "Has Errors" || imported}>
                {imported ? "Imported ✓" : "Import into Ecosystem"}
              </Button>
              {!currentEcosystemId && !bundle.ecosystem && (
                <p className="text-[12px] text-status-warning">No active ecosystem and no ecosystem metadata in this file — create or select an ecosystem first.</p>
              )}
              {imported && <p className="text-[12px] text-status-healthy">Records imported — redirecting to Actor Registry…</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-panelAlt/50 p-3.5 text-center">
      <p className="text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-ink-500">{label}</p>
    </div>
  );
}
