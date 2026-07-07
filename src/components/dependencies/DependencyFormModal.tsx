"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Label, Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Actor, Criticality, Dependency, DependencyStatus } from "@/lib/types";
import dependencyRuleCatalog from "@/config/dependencyRules.json";

type FormValue = Omit<Dependency, "id" | "ecosystemId">;

const TYPES: Dependency["dependencyType"][] = ["Data", "Material", "Financial", "Contractual", "Technology", "Service"];
const CRITICALITY: Criticality[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: DependencyStatus[] = ["Active", "At Risk", "Broken"];

export function DependencyFormModal({
  open,
  onClose,
  actors,
  initial,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  actors: Actor[];
  initial?: (Dependency & { id: string }) | null;
  onSubmit: (data: FormValue) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<FormValue>(() => toForm(initial, actors));
  const key = initial?.id ?? `${initial ? "" : "new"}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setForm(toForm(initial, actors));
  }

  const set = <K extends keyof FormValue>(k: K, v: FormValue[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Dependency" : "New Dependency"} width="max-w-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>From Actor</Label>
            <Select value={form.fromActorId} onChange={(e) => set("fromActorId", e.target.value)}>
              {actors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>To Actor</Label>
            <Select value={form.toActorId} onChange={(e) => set("toActorId", e.target.value)}>
              {actors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dependency Type</Label>
            <Select value={form.dependencyType} onChange={(e) => set("dependencyType", e.target.value as Dependency["dependencyType"])}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <Label>Dependency Rule</Label>
            <Select value={form.ruleId ?? ""} onChange={(e) => set("ruleId", e.target.value || null)}>
              <option value="">None</option>
              {(dependencyRuleCatalog as any[]).map((r) => <option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <Label>Dependency Strength ({form.strength})</Label>
          <input
            type="range" min={0} max={100} value={form.strength}
            onChange={(e) => set("strength", Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            style={{ background: `linear-gradient(to right, #0B5FFF ${form.strength}%, #E5E9F0 ${form.strength}%)` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Criticality</Label>
            <Select value={form.criticality} onChange={(e) => set("criticality", e.target.value as Criticality)}>
              {CRITICALITY.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => set("status", e.target.value as DependencyStatus)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
          {initial && onDelete && (
            <Button type="button" variant="danger" className="mr-auto" onClick={onDelete}>Delete</Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initial ? "Save Changes" : "Create Dependency"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function toForm(initial: (Dependency & { id: string }) | null | undefined, actors: Actor[]): FormValue {
  if (initial) {
    const { id, ecosystemId, ...rest } = initial;
    return rest;
  }
  return {
    fromActorId: actors[0]?.id ?? "",
    toActorId: actors[1]?.id ?? actors[0]?.id ?? "",
    dependencyType: "Service",
    strength: 50,
    ruleId: null,
    criticality: "Medium",
    status: "Active",
  };
}
