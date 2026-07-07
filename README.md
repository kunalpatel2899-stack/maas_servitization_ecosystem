# GDSS — Governance Decision Support Platform
### Resilience-Oriented Governance Framework (ROGF) · Manufacturing-as-a-Service Ecosystems
**TUHH Institute Log>U — Logistik und Unternehmensführung** · Master's Thesis Instrument

## What this is

A fully interactive **Governance Assessment Platform**, not a static dashboard. Researchers and
practitioners can create ecosystems, register actors, model dependencies visually, configure
governance rules, run a live ROGMA (Resilience-Oriented Governance Maturity Assessment), simulate
disruption scenarios, and export governance assessment reports (PDF / Excel / CSV) — all against
real, user-editable data. Nothing is hardcoded: every KPI, risk, recommendation and lifecycle
readiness score is computed from the actors/dependencies/rules currently in state.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first load no ecosystem exists — either **create one** via the
Ecosystem Builder, or **load a bundled sample** (Catena-X, a mature 18-actor automotive data
ecosystem; or the Small Manufacturing Marketplace, a 6-actor early-stage ecosystem with elevated
governance risk) from the Ecosystem Builder or the guided empty state shown on any module.

```bash
npm run build   # production build — verified clean (0 type errors, all 11 routes render)
npm run start   # serve the production build
```

Requires Node.js 18.18+ (tested on Node 22). All application data is stored in the browser via
`localStorage` (zustand `persist`) — there is no backend.

## Platform modules (left sidebar)

- **Dashboard** — live ROGMA hero card, 10 KPI cards, top governance/dependency risks, lifecycle
  summary, network preview and AI decision-support recommendations for the active ecosystem.
- **Ecosystem Builder** — create/edit ecosystems (name, industry, country, platform, description,
  lifecycle phase, platform type/openness, organization count) or load a sample ecosystem.
- **Actor Registry** — add/edit/delete/search/filter actors in a data table (type, role, authority,
  trust, criticality, platform membership, country, capabilities, resources, status).
- **Dependency Mapping** — an interactive React Flow canvas: drag from one actor to another to
  create a dependency, click an edge to edit it, or use the table view. Edge color = risk, edge
  thickness = dependency strength, node size = actor authority.
- **Governance Rules** — 14 configurable rules (G1–G14). Toggle active/inactive, edit owner,
  compliance and impact; the Governance Void Score recalculates instantly.
- **Lifecycle** — Emergence → Evolution → Maturity → Transformation stepper with dynamically
  computed completed/remaining criteria, required KPIs and transition readiness.
- **Resilience** — concentration share, cyber-resilience/redundancy rule status, unstable critical
  dependencies, and resilience-focused KPI trend charts.
- **ROGMA Assessment** — the "Run Governance Assessment" action: calculates every KPI, the ROGMA
  composite, ecosystem health, lifecycle readiness, phase gate, governance gaps, dependency risks
  and recommendations in one pass, and persists the result for the Reports module.
- **Simulation** — 7 scenario levers (actor exit, cyber attack, platform failure, governance
  change, regulatory change, low data interoperability, new actor joins) applied to the *real*
  ecosystem entities; network, KPIs, ROGMA, risks and recommendations update immediately, shown
  against the unmodified baseline.
- **Reports** — export a full Governance Assessment Report as PDF (jsPDF + autotable), Excel
  (multi-sheet SheetJS workbook) or CSV (sectioned flat export).
- **Settings** — reset local platform data; about section.

## Configuration-driven architecture

Nothing is hardcoded into components. Extend the platform by editing JSON only:

```
src/config/
  actorTypes.json         19 actor type templates (category + default governance role)
  governanceRules.json    14 governance rule templates (G1–G14: title, description, category, default owner)
  kpiDefinitions.json     10 KPI definitions (target, threshold, lowerIsBetter, weight, category)
  sampleEcosystems.json   2 full sample ecosystems (Catena-X, Small Manufacturing Marketplace) —
                          each bundles an ecosystem + actors + dependencies + governance rules
```

Add a new actor type, a 15th governance rule, or a third sample ecosystem by editing these files —
no application code changes required.

## Project structure

```
src/
  app/                    Next.js App Router pages (one per sidebar module)
  components/
    layout/               Sidebar, Topbar, RequireEcosystem (guarded empty state)
    ecosystem/            EcosystemSwitcher, EcosystemForm
    actors/                ActorFormModal
    dependencies/          DependencyGraph (React Flow), DependencyActorNode, DependencyFormModal
    governance/            GovernanceRuleCard
    lifecycle/             LifecyclePanel
    kpis/                  KPICard, KPIGrid
    dashboard/             HeroGovernanceCard, GovernanceRiskPanel, DecisionSupportPanel, TrendAnalytics
    simulation/            SimulationPanel
    ui/                    Card, Badge, Progress, Sparkline, StatusDot, Slider, Input, Select,
                           Button, Toggle, Modal, Tabs — shared design system primitives
  store/
    useAppStore.ts         Zustand store (persisted) — ecosystems, actors, dependencies,
                           governance rules, simulation inputs, saved assessments, full CRUD +
                           sample-loading actions
  hooks/
    useLiveKPIs.ts         Computes KPIs/ROGMA/health/phase gate for a given ecosystem context
  lib/
    types.ts               Domain types (Ecosystem, Actor, Dependency, GovernanceRule, KPI, ...)
    kpiEngine.ts            10 reusable KPI calculation functions + ROGMA composite + phase-gate logic
    riskEngine.ts           Derives governance gaps & dependency risks from live state
    recommendationEngine.ts AI Decision Support — rule-based recommendation generation
    assessmentEngine.ts     Orchestrates a full "Run Governance Assessment" pass
    simulationEngine.ts     Applies a what-if scenario to real actors/dependencies/rules
    lifecycleCriteria.ts    Dynamic phase-gate completed/remaining criteria
    networkLayout.ts        Deterministic hub-and-spoke graph layout + actor risk-level mapping
    reportGenerator.ts      PDF / Excel / CSV export builders
    utils.ts                cn(), color/class maps, formatting helpers
  config/                 JSON configuration (see above)
```

## How the KPI engine works

Every KPI is a pure function of live state — see `src/lib/kpiEngine.ts`. For example:

- **Governance Void Score** = weighted gap from inactive governance rules + low average compliance.
- **Concentration Risk Index** = share of total dependency strength concentrated on the single
  most-relied-upon actor (a Herfindahl-style concentration measure).
- **Resilience Absorption** = inverse function of concentration risk and unmitigated critical
  dependencies, with a redundancy bonus if the Capacity Redundancy Rule (G14) is active.

All 10 formulas are documented inline. `calculateROGMA()` combines them into a single weighted
composite score; weights and targets live in `kpiDefinitions.json`, not in code.

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Zustand (persisted state) ·
React Flow · Recharts · Framer Motion · Lucide Icons · jsPDF + jspdf-autotable · SheetJS (xlsx).

## Suggested next steps for the thesis defense

1. `npm run dev`, load the Catena-X sample, and record a walkthrough: Dashboard → Governance
   Rules (deactivate G4) → watch the Governance Void Score and Dashboard risks update → Simulation
   (trigger a Platform Failure) → Reports (export the PDF).
2. Load the Small Manufacturing Marketplace sample to demonstrate a lower-maturity, higher-risk
   ecosystem side by side.
3. Deploy to Vercel (`vercel deploy`) for a shareable link during the defense.
