"use client";

import { useState } from "react";
import type { Ecosystem, LifecyclePhaseName, PlatformType } from "@/lib/types";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type FormValue = Omit<Ecosystem, "id">;

const PHASES: LifecyclePhaseName[] = ["Emergence", "Evolution", "Maturity", "Transformation"];
const PLATFORM_TYPES: PlatformType[] = ["Centralized", "Federated", "Decentralized"];

export function EcosystemForm({
  initial,
  onSubmit,
  submitLabel = "Create Ecosystem",
}: {
  initial?: Partial<FormValue>;
  onSubmit: (data: FormValue) => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<FormValue>({
    name: initial?.name ?? "",
    industry: initial?.industry ?? "",
    country: initial?.country ?? "",
    platform: initial?.platform ?? "",
    description: initial?.description ?? "",
    currentPhase: initial?.currentPhase ?? "Emergence",
    platformType: initial?.platformType ?? "Centralized",
    platformOpenness: initial?.platformOpenness ?? 50,
    numOrganizations: initial?.numOrganizations ?? 1,
    dateCreated: initial?.dateCreated ?? new Date().toISOString().slice(0, 10),
  });

  const set = <K extends keyof FormValue>(key: K, value: FormValue[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Ecosystem Name</Label>
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Catena-X" />
        </div>
        <div>
          <Label>Industry</Label>
          <Input required value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Automotive Manufacturing" />
        </div>
        <div>
          <Label>Country</Label>
          <Input required value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="e.g. Germany" />
        </div>
        <div>
          <Label>Platform</Label>
          <Input required value={form.platform} onChange={(e) => set("platform", e.target.value)} placeholder="e.g. Shared Data Space" />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the ecosystem's purpose and scope..." />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label>Current Lifecycle Phase</Label>
          <Select value={form.currentPhase} onChange={(e) => set("currentPhase", e.target.value as LifecyclePhaseName)}>
            {PHASES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Platform Type</Label>
          <Select value={form.platformType} onChange={(e) => set("platformType", e.target.value as PlatformType)}>
            {PLATFORM_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Number of Organizations</Label>
          <Input
            type="number"
            min={0}
            required
            value={form.numOrganizations}
            onChange={(e) => set("numOrganizations", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Platform Openness ({form.platformOpenness}%)</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={form.platformOpenness}
            onChange={(e) => set("platformOpenness", Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-glow"
            style={{ background: `linear-gradient(to right, #0B5FFF ${form.platformOpenness}%, #E5E9F0 ${form.platformOpenness}%)` }}
          />
        </div>
        <div>
          <Label>Date Created</Label>
          <Input type="date" value={form.dateCreated} onChange={(e) => set("dateCreated", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
        <Button type="submit" variant="primary">{submitLabel}</Button>
      </div>
    </form>
  );
}
