"use client";

import { BarChart3, Crown, Flame, AlertOctagon, Zap, Info } from "lucide-react";
import type { Actor, Dependency } from "@/lib/types";
import { computeNetworkAnalytics } from "@/lib/networkAnalytics";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

export function NetworkAnalyticsPanel({ actors, dependencies }: { actors: Actor[]; dependencies: Dependency[] }) {
  const a = computeNetworkAnalytics(actors, dependencies);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={15} className="text-brand-blue" /> Network Analytics
          </CardTitle>
          <CardSubtitle>Structural analysis of the dependency graph — centrality, density and failure exposure</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Network Density" value={`${a.networkDensity}%`} tip="Share of all possible directed actor-to-actor links that actually exist. Higher density means more redundant, resilient connectivity." />
          <Stat label="Avg. Connectivity" value={`${a.avgConnectivity}`} tip="Average number of dependency links per actor." />
          <Stat label="Critical Dependencies" value={`${a.criticalDependencies.length}`} tip="Dependencies flagged High or Critical criticality — disruption here has outsized impact." />
          <Stat label="Single Points of Failure" value={`${a.singlePointsOfFailure.length}`} tip="Actors holding >30% of weighted network degree with High/Critical criticality — their exit or failure would fragment the network." />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-surface-borderLight bg-surface-panelAlt/50 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              <Crown size={13} className="text-brand-blue" /> Most Central Actor
            </p>
            {a.mostCentralActor ? (
              <p className="text-sm font-bold text-ink-900">
                {a.mostCentralActor.name}{" "}
                <span className="font-mono text-[11px] font-normal text-ink-500">(weighted degree {a.mostCentralActor.weightedDegree})</span>
              </p>
            ) : (
              <p className="text-[12px] text-ink-400">Not enough data</p>
            )}
          </div>

          <div className="rounded-lg border border-surface-borderLight bg-surface-panelAlt/50 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              <Zap size={13} className="text-brand-blue" /> Highest Dependency
            </p>
            {a.highestDependency ? (
              <p className="text-sm font-bold text-ink-900">
                {a.highestDependency.from} → {a.highestDependency.to}{" "}
                <span className="font-mono text-[11px] font-normal text-ink-500">({a.highestDependency.strength}, {a.highestDependency.type})</span>
              </p>
            ) : (
              <p className="text-[12px] text-ink-400">Not enough data</p>
            )}
          </div>

          <div className="rounded-lg border border-status-critical/25 bg-status-critical/[0.03] p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-status-critical">
              <AlertOctagon size={13} /> Single Points of Failure
            </p>
            {a.singlePointsOfFailure.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {a.singlePointsOfFailure.map((s) => <Badge key={s.actorId}>{s.name}</Badge>)}
              </div>
            ) : (
              <p className="text-[12px] text-ink-400">None detected</p>
            )}
          </div>

          <div className="rounded-lg border border-surface-borderLight bg-surface-panelAlt/50 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              <Flame size={13} className="text-brand-blue" /> Dependency Hotspots
            </p>
            {a.hotspots.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {a.hotspots.map((s) => <Badge key={s.actorId}>{s.name} ({s.degreeCount})</Badge>)}
              </div>
            ) : (
              <p className="text-[12px] text-ink-400">None detected</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Node Importance Ranking</p>
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-surface-panelAlt text-[10px] uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Rank</th>
                  <th className="px-3 py-2 font-semibold">Actor</th>
                  <th className="px-3 py-2 font-semibold">Weighted Degree</th>
                  <th className="px-3 py-2 font-semibold">Link Count</th>
                </tr>
              </thead>
              <tbody>
                {a.importanceRanking.slice(0, 8).map((r) => (
                  <tr key={r.actorId} className="border-t border-surface-border">
                    <td className="px-3 py-1.5 font-mono text-ink-500">#{r.rank}</td>
                    <td className="px-3 py-1.5 font-medium text-ink-900">{r.name}</td>
                    <td className="px-3 py-1.5 font-mono text-ink-700">{r.weightedDegree}</td>
                    <td className="px-3 py-1.5 font-mono text-ink-700">{r.degreeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tip }: { label: string; value: string; tip?: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-panelAlt/50 p-3.5 text-center">
      <p className="text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-medium text-ink-500">
        {label}
        {tip && (
          <Tooltip text={tip}>
            <Info size={10} className="text-ink-300" />
          </Tooltip>
        )}
      </p>
    </div>
  );
}
