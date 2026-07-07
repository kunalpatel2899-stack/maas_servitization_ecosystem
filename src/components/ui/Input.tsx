import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-semibold text-ink-700", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-surface-borderLight bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300",
        "focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-surface-borderLight bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300",
        "focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}
