"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { EcosystemSwitcher } from "@/components/ecosystem/EcosystemSwitcher";

// Every route gets a short "what this page does" line so the platform reads
// like a guided methodology rather than a generic app shell — this is the
// page-level half of the UX polish; the Sidebar owns step-level progress.
const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Live governance overview of the selected ecosystem — answers \"how healthy is this ecosystem right now?\"" },
  "/ecosystem-builder": { title: "Ecosystem Builder", subtitle: "Step 1 — define, import or generate the ecosystem that every later step operates on" },
  "/questionnaire": { title: "Guided Questionnaire", subtitle: "A structured, non-technical path to Step 1 — answer questions instead of filling forms" },
  "/import": { title: "Import Data", subtitle: "Bulk-populate an ecosystem from Excel, CSV or JSON instead of manual entry" },
  "/actors": { title: "Actor Registry", subtitle: "Step 2 — register the actors whose authority, trust and criticality drive every KPI" },
  "/dependencies": { title: "Dependency Mapping", subtitle: "Step 3 — model the inter-actor dependency network that concentration and resilience metrics are computed from" },
  "/governance": { title: "Governance Rules", subtitle: "Step 4 — activate and configure the G1–G14 governance rule catalog and its compliance levels" },
  "/lifecycle": { title: "Lifecycle", subtitle: "Step 5 — confirm the ecosystem's current lifecycle phase and review phase-gate criteria" },
  "/resilience": { title: "Resilience", subtitle: "Assess absorption capacity, redundancy and recovery posture against disruption" },
  "/assessment": { title: "ROGMA Assessment", subtitle: "Step 6 — validate data sufficiency, then run the full governance assessment" },
  "/rogma-analysis": { title: "ROGMA Analysis", subtitle: "Step 7 — break the ROGMA composite down into per-KPI contributions — answers \"why this score?\"" },
  "/decision-support": { title: "Decision Support", subtitle: "Step 8 — executive narrative and prioritized governance actions — answers \"what should be done?\"" },
  "/simulation": { title: "Simulation", subtitle: "Step 9 — stress-test the live ecosystem against disruption scenarios before they happen" },
  "/reports": { title: "Reports", subtitle: "Step 10 — export a consulting-grade governance assessment report for stakeholders" },
  "/settings": { title: "Settings", subtitle: "Platform preferences and local data management" },
};

export function Topbar() {
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? { title: "GDSS", subtitle: "" };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-surface-border bg-white/90 px-6 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-bold text-ink-900">{meta.title}</h1>
        <p className="truncate text-[11px] text-ink-400">{meta.subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <EcosystemSwitcher />
        <div className="hidden items-center gap-2 border-l border-surface-border pl-3 md:flex">
          <Image src="/logos/logu-logo.png" alt="Log>U" width={72} height={29} />
        </div>
      </div>
    </header>
  );
}
