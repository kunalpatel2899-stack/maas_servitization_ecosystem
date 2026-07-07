"use client";

import { Settings as SettingsIcon, Trash2, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { confirmAction } from "@/lib/confirm";
import { toast } from "@/lib/toast";

export default function SettingsPage() {
  const ecosystems = useAppStore((s) => s.ecosystems);

  const resetAll = async () => {
    const ok = await confirmAction({
      title: "Reset All Platform Data",
      message:
        "This will permanently delete all ecosystems, actors, dependencies, rules and assessments stored in this browser. This cannot be undone.",
      confirmLabel: "Delete Everything",
      danger: true,
    });
    if (ok) {
      toast.warning("Resetting platform data...");
      useAppStore.persist.clearStorage();
      window.location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon size={15} className="text-brand-blue" /> Platform Settings
            </CardTitle>
            <CardSubtitle>Manage local platform data</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-surface-borderLight p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">Stored Ecosystems</p>
              <p className="text-[12px] text-ink-500">{ecosystems.length} ecosystem(s) currently stored in this browser's local storage.</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-status-critical/25 bg-status-critical/[0.03] p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">Reset All Platform Data</p>
              <p className="text-[12px] text-ink-500">Permanently clears every ecosystem, actor, dependency, rule and assessment.</p>
            </div>
            <Button variant="danger" onClick={resetAll}>
              <Trash2 size={14} /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={15} className="text-brand-blue" /> About This Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] leading-relaxed text-ink-600">
            This Governance Decision Support Platform implements the Resilience-Oriented Governance Framework (ROGF) for
            Manufacturing-as-a-Service ecosystems, developed as part of a Master&apos;s thesis at TUHH — Institute Log&gt;U
            (Logistik und Unternehmensführung). All ecosystem data is stored locally in your browser; nothing is sent to a
            server. Actors, dependencies, governance rules and KPI definitions are configuration-driven (see{" "}
            <code className="rounded bg-surface-panelAlt px-1 py-0.5 text-[11px]">src/config/*.json</code>) so the platform
            can be extended with new ecosystems, rules or actor types without code changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
