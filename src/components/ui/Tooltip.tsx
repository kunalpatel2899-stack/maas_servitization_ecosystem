"use client";

import type { ReactNode } from "react";

// CSS-only hover tooltip (no JS positioning library needed) — used to attach
// short explanatory text to key metrics and labels across the platform.
export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group/tooltip relative inline-flex items-center">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-md bg-ink-900 px-2.5 py-1.5 text-center text-[11px] font-medium leading-snug text-white opacity-0 shadow-lifted transition-opacity duration-150 group-hover/tooltip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
