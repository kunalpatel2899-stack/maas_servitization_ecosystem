"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import {
  useAppStore,
  useCurrentActors,
  useCurrentDependencies,
  useCurrentEcosystem,
  useCurrentGovernanceRules,
} from "@/store/useAppStore";
import { FRAMEWORK_STEPS, type FrameworkStepContext } from "@/lib/frameworkSteps";
import { calculateKPIs } from "@/lib/kpiEngine";
import kpiDefinitions from "@/config/kpiDefinitions.json";
import type { KPIDefinition } from "@/lib/types";
import { Progress } from "@/components/ui/Progress";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const ecosystem = useCurrentEcosystem();
  const actors = useCurrentActors();
  const dependencies = useCurrentDependencies();
  const rules = useCurrentGovernanceRules();
  const assessment = useAppStore((s) => (ecosystem ? s.assessments[ecosystem.id] ?? null : null));
  const hasSimulated = useAppStore((s) => (ecosystem ? !!s.hasSimulated[ecosystem.id] : false));
  const hasGeneratedReport = useAppStore((s) => (ecosystem ? !!s.hasGeneratedReport[ecosystem.id] : false));

  const kpis = useMemo(() => {
    if (!ecosystem) return [];
    return calculateKPIs({ ecosystem, actors, dependencies, rules }, kpiDefinitions as KPIDefinition[]);
  }, [ecosystem, actors, dependencies, rules]);

  const ctx: FrameworkStepContext = { ecosystem, actors, dependencies, rules, kpis, assessment, hasSimulated, hasGeneratedReport };
  const completedCount = FRAMEWORK_STEPS.filter((s) => s.isComplete(ctx)).length;
  const progressPct = Math.round((completedCount / FRAMEWORK_STEPS.length) * 100);
  const currentStepIndex = FRAMEWORK_STEPS.findIndex((s) => s.href === pathname);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-surface-border bg-white transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[264px]"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-surface-border px-4">
        <Image src="/logos/tuhh-logo.svg" alt="TUHH" width={40} height={11} priority />
        {!collapsed && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12px] font-bold text-ink-900">GDSS Platform</span>
            <span className="truncate text-[10px] text-ink-400">Log&gt;U · ROGF Methodology</span>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3">
        {/* Overview */}
        <div className="flex flex-col gap-0.5">
          <NavLink href="/" label="Dashboard" icon={LayoutDashboard} active={pathname === "/"} collapsed={collapsed} />
        </div>

        {/* 10-step ROGF methodology */}
        <div>
          {!collapsed && (
            <div className="mb-2 px-2.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">ROGF Methodology</span>
                <span className="font-mono text-[10px] font-bold text-brand-blue">{progressPct}%</span>
              </div>
              <Progress value={progressPct} status={progressPct === 100 ? "healthy" : "warning"} className="h-1" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {FRAMEWORK_STEPS.map((s, i) => {
              const active = pathname === s.href;
              const complete = s.isComplete(ctx);
              const isCurrent = i === currentStepIndex;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  title={`Step ${s.step}: ${s.label}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                    active ? "bg-brand-blueLight text-brand-blue" : "text-ink-500 hover:bg-surface-panelAlt hover:text-ink-900"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                      complete
                        ? "border-status-healthy bg-status-healthy/10 text-status-healthy"
                        : isCurrent
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-surface-borderLight text-ink-400"
                    )}
                  >
                    {complete ? <CheckCircle2 size={12} /> : s.step}
                  </span>
                  {!collapsed && <span className="truncate">{s.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Supplementary modules */}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-surface-border pt-3">
          <NavLink href="/resilience" label="Resilience" icon={ShieldCheck} active={pathname === "/resilience"} collapsed={collapsed} />
          <NavLink href="/settings" label="Settings" icon={SettingsIcon} active={pathname === "/settings"} collapsed={collapsed} />
        </div>
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="m-2.5 flex items-center justify-center gap-2 rounded-lg border border-surface-borderLight py-2 text-ink-400 hover:bg-surface-panelAlt hover:text-ink-700"
      >
        {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
      </button>
    </aside>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
        active ? "bg-brand-blueLight text-brand-blue" : "text-ink-500 hover:bg-surface-panelAlt hover:text-ink-900"
      )}
    >
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
