"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, Factory, Trash2, CheckCircle2, Pencil, ClipboardList, UploadCloud, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useAppStore, useCurrentEcosystem } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EcosystemForm } from "@/components/ecosystem/EcosystemForm";
import type { Ecosystem } from "@/lib/types";
import { confirmAction } from "@/lib/confirm";
import { toast } from "@/lib/toast";

export default function EcosystemBuilderPage() {
  const ecosystems = useAppStore((s) => s.ecosystems);
  const createEcosystem = useAppStore((s) => s.createEcosystem);
  const updateEcosystem = useAppStore((s) => s.updateEcosystem);
  const deleteEcosystem = useAppStore((s) => s.deleteEcosystem);
  const setCurrentEcosystem = useAppStore((s) => s.setCurrentEcosystem);
  const loadSampleEcosystem = useAppStore((s) => s.loadSampleEcosystem);
  const current = useCurrentEcosystem();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ecosystem | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sample Ecosystems</CardTitle>
            <CardSubtitle>Load a fully populated ecosystem to explore the platform immediately</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => { loadSampleEcosystem(0); toast.success("Catena-X sample ecosystem loaded."); }}
              className="flex items-start gap-3 rounded-lg border border-surface-borderLight bg-surface-panelAlt/60 p-4 text-left hover:border-brand-blue/40 hover:bg-brand-blueLight/40"
            >
              <Sparkles size={18} className="mt-0.5 shrink-0 text-brand-blue" />
              <div>
                <p className="text-sm font-semibold text-ink-900">Catena-X</p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  Mature, federated automotive data ecosystem — 18 actors, 19 dependencies, Evolution phase.
                </p>
              </div>
            </button>
            <button
              onClick={() => { loadSampleEcosystem(1); toast.success("Small Manufacturing Marketplace sample loaded."); }}
              className="flex items-start gap-3 rounded-lg border border-surface-borderLight bg-surface-panelAlt/60 p-4 text-left hover:border-brand-blue/40 hover:bg-brand-blueLight/40"
            >
              <Sparkles size={18} className="mt-0.5 shrink-0 text-brand-blue" />
              <div>
                <p className="text-sm font-semibold text-ink-900">Small Manufacturing Marketplace</p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  Early-stage regional marketplace — 6 actors, higher concentration risk, Emergence phase.
                </p>
              </div>
            </button>
            <button
              onClick={() => { loadSampleEcosystem(2); toast.success("Xometry case study loaded — sourced from public SEC filings and company disclosures."); }}
              className="flex items-start gap-3 rounded-lg border border-status-healthy/30 bg-status-healthy/[0.04] p-4 text-left hover:border-status-healthy/60 hover:bg-status-healthy/10"
            >
              <BadgeCheck size={18} className="mt-0.5 shrink-0 text-status-healthy" />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                  Xometry
                  <span className="rounded-full bg-status-healthy/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-status-healthy">
                    Verified Real Case
                  </span>
                </p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  Real, publicly documented AI-native MaaS marketplace (Nasdaq: XMTR) — 11 actors, 15 dependencies, sourced from SEC filings, Evolution phase.
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Your Ecosystems</CardTitle>
            <CardSubtitle>Select the active ecosystem or create a new one</CardSubtitle>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/questionnaire">
              <Button variant="secondary">
                <ClipboardList size={14} /> Guided Questionnaire
              </Button>
            </Link>
            <Link href="/import">
              <Button variant="secondary">
                <UploadCloud size={14} /> Import Data
              </Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus size={14} /> New Ecosystem
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ecosystems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-surface-borderLight py-12 text-center">
              <Factory size={28} className="text-ink-300" />
              <p className="text-sm text-ink-500">No ecosystems yet. Create one or load a sample above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {ecosystems.map((eco, i) => (
                <motion.div
                  key={eco.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-lg border p-4 ${
                    current?.id === eco.id ? "border-brand-blue bg-brand-blueLight/40" : "border-surface-borderLight bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{eco.name}</p>
                      <p className="mt-0.5 text-[12px] text-ink-500">{eco.industry} · {eco.country}</p>
                    </div>
                    {current?.id === eco.id && <CheckCircle2 size={18} className="shrink-0 text-brand-blue" />}
                  </div>

                  <p className="mt-2 line-clamp-2 text-[12px] text-ink-500">{eco.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge>{eco.currentPhase}</Badge>
                    <Badge>{eco.platformType}</Badge>
                    <Badge>{eco.numOrganizations} orgs</Badge>
                    <Badge>Openness {eco.platformOpenness}%</Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-surface-border pt-3">
                    <Button variant="secondary" onClick={() => setCurrentEcosystem(eco.id)} disabled={current?.id === eco.id}>
                      {current?.id === eco.id ? "Active" : "Select"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(eco);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={13} /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="ml-auto"
                      onClick={async () => {
                        const ok = await confirmAction({
                          title: "Delete Ecosystem",
                          message: `Permanently delete "${eco.name}" and all of its actors, dependencies, governance rule states and assessments?`,
                          confirmLabel: "Delete",
                          danger: true,
                        });
                        if (ok) {
                          deleteEcosystem(eco.id);
                          toast.success(`Ecosystem "${eco.name}" deleted.`);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Ecosystem" : "Create Ecosystem"}>
        <EcosystemForm
          initial={editing ?? undefined}
          submitLabel={editing ? "Save Changes" : "Create Ecosystem"}
          onSubmit={(data) => {
            if (editing) {
              updateEcosystem(editing.id, data);
              toast.success(`Ecosystem "${data.name}" updated.`);
            } else {
              createEcosystem(data);
              toast.success(`Ecosystem "${data.name}" created. Continue to the Actor Registry.`);
            }
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
