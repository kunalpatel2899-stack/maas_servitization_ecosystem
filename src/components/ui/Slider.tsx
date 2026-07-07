"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  icon?: ReactNode;
}

export function Slider({ label, description, value, onChange, min = 0, max = 100, icon }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-700">
          {icon}
          {label}
        </div>
        <span className="rounded-md bg-brand-blueLight px-2 py-0.5 font-mono text-xs font-semibold text-brand-blue">
          {value}%
        </span>
      </div>
      {description && <p className="text-[11px] text-ink-400">{description}</p>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none",
          "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue",
          "[&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
        )}
        style={{
          background: `linear-gradient(to right, #0B5FFF ${pct}%, #E5E9F0 ${pct}%)`,
        }}
      />
    </div>
  );
}
