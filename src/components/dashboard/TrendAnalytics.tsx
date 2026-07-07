"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import type { KPI } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/Card";

const COLORS = ["#0B5FFF", "#2DC6D6", "#1FA97A", "#DB9200", "#E5484D", "#7C5CFC"];

export function TrendAnalytics({ kpis, title = "Trend Analytics", subtitle }: { kpis: KPI[]; title?: string; subtitle?: string }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon size={15} className="text-brand-blue" />
            {title}
          </CardTitle>
          <CardSubtitle>{subtitle ?? "Live KPI history derived from the current ecosystem state"}</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {kpis.map((kpi, i) => {
            const data = kpi.history.map((v, idx) => ({ period: `T${idx + 1}`, value: v }));
            const color = COLORS[i % COLORS.length];
            return (
              <div key={kpi.id} className="rounded-lg border border-surface-border bg-surface-panelAlt/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-ink-900">{kpi.name}</p>
                  <span className="font-mono text-sm font-bold" style={{ color }}>
                    {kpi.current}<span className="ml-0.5 text-[10px] text-ink-400">{kpi.unit === "%" ? "%" : ""}</span>
                  </span>
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F0" vertical={false} />
                      <XAxis dataKey="period" tick={{ fill: "#8A93A3", fontSize: 10 }} axisLine={{ stroke: "#E5E9F0" }} tickLine={false} />
                      <YAxis tick={{ fill: "#8A93A3", fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E9F0", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 2.5, fill: color }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
