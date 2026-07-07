"use client";

import { RotateCcw, SlidersHorizontal, UserX, ShieldAlert, ServerCrash, Scale, Landmark, PlugZap, UserPlus } from "lucide-react";
import type { Actor, SimulationInputs } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { DEFAULT_SIMULATION_INPUTS } from "@/lib/simulationEngine";

export function SimulationPanel({
  actors,
  inputs,
  onChange,
}: {
  actors: Actor[];
  inputs: SimulationInputs;
  onChange: (inputs: SimulationInputs) => void;
}) {
  const isDirty = JSON.stringify(inputs) !== JSON.stringify(DEFAULT_SIMULATION_INPUTS);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-brand-blue" />
            Scenario Simulation
          </CardTitle>
          <CardSubtitle>Test disruptions against the real ecosystem — network, KPIs, ROGMA, lifecycle and recommendations update immediately</CardSubtitle>
        </div>
        <button
          onClick={() => onChange(DEFAULT_SIMULATION_INPUTS)}
          disabled={!isDirty}
          className="flex items-center gap-1.5 rounded-md border border-surface-borderLight bg-white px-3 py-1.5 text-[11px] font-medium text-ink-700 hover:bg-surface-panelAlt disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={12} /> Reset Scenario
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-700">
              <UserX size={13} className="text-brand-blue" /> Actor Exits Ecosystem
            </div>
            <Select value={inputs.actorExitId ?? ""} onChange={(e) => onChange({ ...inputs, actorExitId: e.target.value || null })}>
              <option value="">No actor exit</option>
              {actors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-surface-borderLight px-3.5 py-2.5">
            <span className="flex items-center gap-2 text-xs font-medium text-ink-700">
              <UserPlus size={13} className="text-brand-blue" /> New Actor Joins
            </span>
            <Toggle checked={inputs.newActorJoins} onChange={(v) => onChange({ ...inputs, newActorJoins: v })} />
          </div>

          <Slider
            label="Cyber Attack"
            description="Severity of a cybersecurity incident on shared data infrastructure."
            icon={<ShieldAlert size={13} className="text-brand-blue" />}
            value={inputs.cyberAttackSeverity}
            onChange={(v) => onChange({ ...inputs, cyberAttackSeverity: v })}
          />
          <Slider
            label="Platform Failure"
            description="Degradation of the core orchestration platform."
            icon={<ServerCrash size={13} className="text-brand-blue" />}
            value={inputs.platformFailureSeverity}
            onChange={(v) => onChange({ ...inputs, platformFailureSeverity: v })}
          />
          <Slider
            label="Governance Change"
            description="Uniformly shifts active rule compliance — negative values simulate decline, positive simulate improvement."
            icon={<Scale size={13} className="text-brand-blue" />}
            value={inputs.governanceChangeDelta}
            min={-100}
            max={100}
            onChange={(v) => onChange({ ...inputs, governanceChangeDelta: v })}
          />
          <Slider
            label="Regulatory Change"
            description="Tightens compliance-category governance rules."
            icon={<Landmark size={13} className="text-brand-blue" />}
            value={inputs.regulatoryChangeSeverity}
            onChange={(v) => onChange({ ...inputs, regulatoryChangeSeverity: v })}
          />
          <Slider
            label="Low Data Interoperability"
            description="Degrades the interoperability standard rule and technology/data dependency strength."
            icon={<PlugZap size={13} className="text-brand-blue" />}
            value={inputs.lowInteroperabilitySeverity}
            onChange={(v) => onChange({ ...inputs, lowInteroperabilitySeverity: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
