import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none rounded-lg border border-surface-borderLight bg-white px-3 py-2 pr-8 text-sm text-ink-900",
          "focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10",
          "transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
    </div>
  );
}
