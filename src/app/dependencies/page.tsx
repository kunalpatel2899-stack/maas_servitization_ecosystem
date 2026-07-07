"use client";

import { useState } from "react";
import { Network, Plus, Table2, GitBranch } from "lucide-react";
import type { Connection } from "reactflow";
import {
  useAppStore,
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { DependencyGraph } from "@/components/dependencies/DependencyGraph";
import { DependencyFormModal } from "@/components/dependencies/DependencyFormModal";
import { NetworkAnalyticsPanel } from "@/components/dependencies/NetworkAnalyticsPanel";
import type { Actor, Dependency } from "@/lib/types";
import { confirmAction } from "@/lib/confirm";
import { toast } from "@/lib/toast";

function DependencyMappingContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const addDependency = useAppStore((s) => s.addDependency);
  const updateDependency = useAppStore((s) => s.updateDependency);
  const deleteDependency = useAppStore((s) => s.deleteDependency);

  const [view, setView] = useState("graph");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Dependency | null>(null);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  const openNew = (conn?: Connection) => {
    setEditing(null);
    setPendingConnection(conn ?? null);
    setModalOpen(true);
  };

  if (actors.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14">
            <Network size={28} className="text-ink-300" />
            <p className="text-sm text-ink-500">Add at least two actors in the Actor Registry before mapping dependencies.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network size={15} className="text-brand-blue" /> Dependency Mapping — {ecosystem.name}
            </CardTitle>
            <CardSubtitle>Drag from one actor's edge to another to create a dependency · click an edge to edit</CardSubtitle>
          </div>
          <div className="flex items-center gap-3">
            <Tabs
              tabs={[{ id: "graph", label: "Graph" }, { id: "table", label: "Table" }]}
              active={view}
              onChange={setView}
            />
            <Button variant="primary" onClick={() => openNew()}>
              <Plus size={14} /> Add Dependency
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === "graph" ? (
            <div className="relative">
              <DependencyGraph
                actors={actors}
                dependencies={dependencies}
                onConnect={(c) => openNew(c)}
                onEdgeClick={(id) => {
                  const dep = dependencies.find((d) => d.id === id);
                  if (dep) {
                    setEditing(dep);
                    setModalOpen(true);
                  }
                }}
                onNodeClick={(actor) => setSelectedActor(actor)}
              />
              {selectedActor && (
                <div className="absolute right-4 top-4 w-64 rounded-lg border border-surface-border bg-white p-3.5 shadow-lifted">
                  <p className="text-sm font-semibold text-ink-900">{selectedActor.name}</p>
                  <p className="text-[11px] text-ink-500">{selectedActor.role}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-md bg-surface-panelAlt p-2">
                      <p className="text-ink-400">Authority</p>
                      <p className="font-mono font-bold text-brand-blue">{selectedActor.authorityLevel}</p>
                    </div>
                    <div className="rounded-md bg-surface-panelAlt p-2">
                      <p className="text-ink-400">Trust</p>
                      <p className="font-mono font-bold text-brand-teal">{selectedActor.trustLevel}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedActor(null)} className="mt-2 text-[11px] text-ink-400 hover:text-ink-700">Close</button>
                </div>
              )}
              <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-500">
                <LegendDot color="#1FA97A" label="Healthy" />
                <LegendDot color="#DB9200" label="Warning" />
                <LegendDot color="#E5484D" label="Critical / Broken" />
              </div>
            </div>
          ) : (
            <DependencyTable
              actors={actors}
              dependencies={dependencies}
              onEdit={(d) => { setEditing(d); setModalOpen(true); }}
              onDelete={async (id) => {
                const ok = await confirmAction({
                  title: "Delete Dependency",
                  message: "Remove this dependency relationship from the network? This affects network analytics and KPI calculations.",
                  confirmLabel: "Delete",
                  danger: true,
                });
                if (ok) {
                  deleteDependency(id);
                  toast.success("Dependency deleted.");
                }
              }}
            />
          )}
        </CardContent>
      </Card>

      <NetworkAnalyticsPanel actors={actors} dependencies={dependencies} />

      <DependencyFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPendingConnection(null); }}
        actors={actors}
        initial={editing}
        onSubmit={(data) => {
          if (editing) {
            updateDependency(editing.id, data);
            toast.success("Dependency updated.");
          } else {
            addDependency({
              ...data,
              ecosystemId: ecosystem.id,
              fromActorId: pendingConnection?.source ?? data.fromActorId,
              toActorId: pendingConnection?.target ?? data.toActorId,
            });
            toast.success("Dependency added.");
          }
          setModalOpen(false);
          setPendingConnection(null);
        }}
        onDelete={
          editing
            ? async () => {
                const ok = await confirmAction({
                  title: "Delete Dependency",
                  message: "Remove this dependency relationship from the network? This affects network analytics and KPI calculations.",
                  confirmLabel: "Delete",
                  danger: true,
                });
                if (ok) {
                  deleteDependency(editing.id);
                  toast.success("Dependency deleted.");
                  setModalOpen(false);
                }
              }
            : undefined
        }
      />
    </div>
  );
}

function DependencyTable({
  actors,
  dependencies,
  onEdit,
  onDelete,
}: {
  actors: Actor[];
  dependencies: Dependency[];
  onEdit: (d: Dependency) => void;
  onDelete: (id: string) => void;
}) {
  const nameOf = (id: string) => actors.find((a) => a.id === id)?.name ?? "Unknown";
  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-surface-panelAlt text-[11px] uppercase tracking-wide text-ink-400">
          <tr>
            <th className="px-3.5 py-2.5 font-semibold">From</th>
            <th className="px-3.5 py-2.5 font-semibold">To</th>
            <th className="px-3.5 py-2.5 font-semibold">Type</th>
            <th className="px-3.5 py-2.5 font-semibold">Strength</th>
            <th className="px-3.5 py-2.5 font-semibold">Rule</th>
            <th className="px-3.5 py-2.5 font-semibold">Criticality</th>
            <th className="px-3.5 py-2.5 font-semibold">Status</th>
            <th className="px-3.5 py-2.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dependencies.map((d) => (
            <tr key={d.id} className="border-t border-surface-border hover:bg-surface-panelAlt/60">
              <td className="px-3.5 py-2.5 font-medium text-ink-900">{nameOf(d.fromActorId)}</td>
              <td className="px-3.5 py-2.5 font-medium text-ink-900">{nameOf(d.toActorId)}</td>
              <td className="px-3.5 py-2.5 text-ink-500">{d.dependencyType}</td>
              <td className="px-3.5 py-2.5 font-mono text-ink-700">{d.strength}</td>
              <td className="px-3.5 py-2.5 text-ink-500">{d.ruleId ?? "—"}</td>
              <td className="px-3.5 py-2.5 text-ink-500">{d.criticality}</td>
              <td className="px-3.5 py-2.5 text-ink-500">{d.status}</td>
              <td className="px-3.5 py-2.5 text-right">
                <button onClick={() => onEdit(d)} className="mr-1 text-brand-blue hover:underline">Edit</button>
                <button onClick={() => onDelete(d.id)} className="text-status-critical hover:underline">Delete</button>
              </td>
            </tr>
          ))}
          {dependencies.length === 0 && (
            <tr><td colSpan={8} className="px-3.5 py-8 text-center text-ink-400">No dependencies yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export default function DependencyMappingPage() {
  return (
    <RequireEcosystem>
      <DependencyMappingContent />
    </RequireEcosystem>
  );
}
