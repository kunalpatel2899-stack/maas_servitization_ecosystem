"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-surface-panelAlt p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            active === tab.id ? "bg-white text-brand-blue shadow-card" : "text-ink-500 hover:text-ink-800"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
