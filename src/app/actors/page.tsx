"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
import { useAppStore, useCurrentActors, useCurrentEcosystem } from "@/store/useAppStore";
import { RequireEcosystem } from "@/components/layout/RequireEcosystem";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ActorFormModal } from "@/components/actors/ActorFormModal";
import type { Actor } from "@/lib/types";
import actorTypes from "@/config/actorTypes.json";
import { confirmAction } from "@/lib/confirm";
import { toast } from "@/lib/toast";

const criticalityColor: Record<string, string> = {
  Low: "text-status-healthy bg-status-healthy/10",
  Medium: "text-status-warning bg-status-warning/10",
  High: "text-orange-600 bg-orange-500/10",
  Critical: "text-status-critical bg-status-critical/10",
};

const statusColor: Record<string, string> = {
  Active: "text-status-healthy bg-status-healthy/10",
  Onboarding: "text-brand-blue bg-brand-blueLight",
  Inactive: "text-ink-500 bg-ink-400/10",
  Exited: "text-status-critical bg-status-critical/10",
};

function ActorRegistryContent() {
  const ecosystem = useCurrentEcosystem()!;
  const actors = useCurrentActors();
  const addActor = useAppStore((s) => s.addActor);
  const updateActor = useAppStore((s) => s.updateActor);
  const deleteActor = useAppStore((s) => s.deleteActor);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Actor | null>(null);

  const filtered = useMemo(() => {
    return actors.filter((a) => {
      const matchesSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || a.type === typeFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [actors, search, typeFilter, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users size={15} className="text-brand-blue" /> Actor Registry — {ecosystem.name}
            </CardTitle>
            <CardSubtitle>{actors.length} actor(s) registered</CardSubtitle>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus size={14} /> Add Actor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input className="pl-8" placeholder="Search actors..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select className="max-w-[200px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {(actorTypes as any[]).map((t) => <option key={t.type} value={t.type}>{t.type}</option>)}
            </Select>
            <Select className="max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {["Active", "Onboarding", "Inactive", "Exited"].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface-panelAlt text-[11px] uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Name</th>
                  <th className="px-3.5 py-2.5 font-semibold">Type</th>
                  <th className="px-3.5 py-2.5 font-semibold">Role</th>
                  <th className="px-3.5 py-2.5 font-semibold">Authority</th>
                  <th className="px-3.5 py-2.5 font-semibold">Trust</th>
                  <th className="px-3.5 py-2.5 font-semibold">Criticality</th>
                  <th className="px-3.5 py-2.5 font-semibold">Platform</th>
                  <th className="px-3.5 py-2.5 font-semibold">Country</th>
                  <th className="px-3.5 py-2.5 font-semibold">Status</th>
                  <th className="px-3.5 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-surface-border hover:bg-surface-panelAlt/60">
                    <td className="px-3.5 py-2.5 font-medium text-ink-900">{a.name}</td>
                    <td className="px-3.5 py-2.5 text-ink-500">{a.type}</td>
                    <td className="px-3.5 py-2.5 text-ink-500">{a.role}</td>
                    <td className="px-3.5 py-2.5 font-mono text-ink-700">{a.authorityLevel}</td>
                    <td className="px-3.5 py-2.5 font-mono text-ink-700">{a.trustLevel}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${criticalityColor[a.criticality]}`}>{a.criticality}</span>
                    </td>
                    <td className="px-3.5 py-2.5">{a.platformMember ? <Badge>Member</Badge> : <span className="text-ink-300">—</span>}</td>
                    <td className="px-3.5 py-2.5 text-ink-500">{a.country}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setEditing(a); setModalOpen(true); }}
                          className="rounded-md p-1.5 text-ink-400 hover:bg-brand-blueLight hover:text-brand-blue"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            const ok = await confirmAction({
                              title: "Delete Actor",
                              message: `Remove "${a.name}" from the ecosystem? Any dependencies referencing this actor will be affected.`,
                              confirmLabel: "Delete",
                              danger: true,
                            });
                            if (ok) {
                              deleteActor(a.id);
                              toast.success(`Actor "${a.name}" deleted.`);
                            }
                          }}
                          className="rounded-md p-1.5 text-ink-400 hover:bg-status-critical/10 hover:text-status-critical"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3.5 py-8 text-center text-ink-400">No actors match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ActorFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={(data) => {
          if (editing) {
            updateActor(editing.id, data);
            toast.success(`Actor "${data.name}" updated.`);
          } else {
            addActor({ ...data, ecosystemId: ecosystem.id });
            toast.success(`Actor "${data.name}" added.`);
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
}

export default function ActorRegistryPage() {
  return (
    <RequireEcosystem>
      <ActorRegistryContent />
    </RequireEcosystem>
  );
}
