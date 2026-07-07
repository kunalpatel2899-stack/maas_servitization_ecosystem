"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import type { Actor, ActorStatus, Criticality } from "@/lib/types";
import actorTypes from "@/config/actorTypes.json";

type FormValue = Omit<Actor, "id" | "ecosystemId">;

const CRITICALITY: Criticality[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: ActorStatus[] = ["Active", "Onboarding", "Inactive", "Exited"];

export function ActorFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Actor | null;
  onSubmit: (data: FormValue) => void;
}) {
  const [form, setForm] = useState<FormValue>(() => toForm(initial));

  // Reset form whenever a different actor is opened for edit / a new add starts.
  const key = initial?.id ?? "new";
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setForm(toForm(initial));
  }

  const set = <K extends keyof FormValue>(k: K, v: FormValue[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Actor" : "Add Actor"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Actor Name</Label>
            <Input required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label>Actor Type</Label>
            <Select
              value={form.type}
              onChange={(e) => {
                const t = e.target.value;
                const preset = (actorTypes as any[]).find((a) => a.type === t);
                set("type", t);
                if (preset) set("role", preset.defaultRole);
              }}
            >
              {(actorTypes as any[]).map((t) => (
                <option key={t.type} value={t.type}>{t.type}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Role</Label>
            <Input required value={form.role} onChange={(e) => set("role", e.target.value)} />
          </div>
          <div>
            <Label>Country</Label>
            <Input required value={form.country} onChange={(e) => set("country", e.target.value)} />
          </div>
          <div>
            <Label>Criticality</Label>
            <Select value={form.criticality} onChange={(e) => set("criticality", e.target.value as Criticality)}>
              {CRITICALITY.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => set("status", e.target.value as ActorStatus)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Authority Level ({form.authorityLevel})</Label>
            <input type="range" min={0} max={100} value={form.authorityLevel}
              onChange={(e) => set("authorityLevel", Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
              style={{ background: `linear-gradient(to right, #0B5FFF ${form.authorityLevel}%, #E5E9F0 ${form.authorityLevel}%)` }} />
          </div>
          <div>
            <Label>Trust Level ({form.trustLevel})</Label>
            <input type="range" min={0} max={100} value={form.trustLevel}
              onChange={(e) => set("trustLevel", Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-teal [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
              style={{ background: `linear-gradient(to right, #2DC6D6 ${form.trustLevel}%, #E5E9F0 ${form.trustLevel}%)` }} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-surface-borderLight px-3.5 py-2.5">
          <span className="text-[13px] font-medium text-ink-700">Platform Member</span>
          <Toggle checked={form.platformMember} onChange={(v) => set("platformMember", v)} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Capabilities (comma-separated)</Label>
            <Textarea rows={2} value={form.capabilities.join(", ")} onChange={(e) => set("capabilities", splitList(e.target.value))} />
          </div>
          <div>
            <Label>Resources (comma-separated)</Label>
            <Textarea rows={2} value={form.resources.join(", ")} onChange={(e) => set("resources", splitList(e.target.value))} />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initial ? "Save Changes" : "Add Actor"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function splitList(v: string): string[] {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function toForm(initial?: Actor | null): FormValue {
  if (initial) {
    const { id, ecosystemId, ...rest } = initial;
    return rest;
  }
  return {
    name: "",
    type: (actorTypes as any[])[0].type,
    role: (actorTypes as any[])[0].defaultRole,
    authorityLevel: 50,
    trustLevel: 50,
    criticality: "Medium",
    platformMember: false,
    country: "",
    capabilities: [],
    resources: [],
    status: "Onboarding",
  };
}
