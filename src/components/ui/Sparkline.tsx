"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({ data, color = "#0B5FFF" }: { data: number[]; color?: string }) {
  const points = data.map((value, i) => ({ i, value }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
