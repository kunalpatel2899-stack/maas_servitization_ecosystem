"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Factory, Plus, Check } from "lucide-react";
import { useAppStore, useCurrentEcosystem } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function EcosystemSwitcher() {
  const [open, setOpen] = useState(false);
  const ecosystems = useAppStore((s) => s.ecosystems);
  const setCurrentEcosystem = useAppStore((s) => s.setCurrentEcosystem);
  const current = useCurrentEcosystem();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-surface-borderLight bg-white px-3 py-1.5 text-[13px] font-medium text-ink-800 hover:bg-surface-panelAlt"
      >
        <Factory size={14} className="text-brand-blue" />
        <span className="max-w-[220px] truncate">{current ? current.name : "No ecosystem selected"}</span>
        <ChevronDown size={14} className="text-ink-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-40 mt-1.5 w-72 rounded-lg border border-surface-border bg-white p-1.5 shadow-lifted">
            {ecosystems.length === 0 && (
              <p className="px-2.5 py-2 text-[12px] text-ink-400">No ecosystems yet — create one to begin.</p>
            )}
            {ecosystems.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setCurrentEcosystem(e.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-surface-panelAlt",
                  current?.id === e.id ? "text-brand-blue" : "text-ink-700"
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{e.name}</span>
                  <span className="block truncate text-[11px] text-ink-400">{e.industry} · {e.currentPhase}</span>
                </span>
                {current?.id === e.id && <Check size={14} />}
              </button>
            ))}
            <Link
              href="/ecosystem-builder"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-brand-blue hover:bg-brand-blueLight"
            >
              <Plus size={14} />
              New Ecosystem
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
