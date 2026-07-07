import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-brand-blue text-white hover:bg-brand-blueDark shadow-card",
  secondary: "bg-white text-ink-700 border border-surface-borderLight hover:bg-surface-panelAlt",
  ghost: "bg-transparent text-ink-500 hover:bg-surface-panelAlt hover:text-ink-900",
  danger: "bg-status-critical/10 text-status-critical hover:bg-status-critical/20",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
