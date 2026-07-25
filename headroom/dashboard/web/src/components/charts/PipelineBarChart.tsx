import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PipelineStage {
  name: string;
  average_ms: number;
  max_ms: number;
}

interface PipelineBarChartProps {
  stages: PipelineStage[];
  className?: string;
}

/** Return a color based on the latency value. */
function latencyColor(ms: number): string {
  if (ms > 100) return "var(--color-negative)";
  if (ms > 50) return "var(--color-warning)";
  return "var(--color-positive)";
}

export function PipelineBarChart({ stages, className }: PipelineBarChartProps) {
  const prefersReduced = useReducedMotion();

  const data = useMemo(
    () =>
      stages
        .map((s) => ({
          name: s.name,
          average_ms: s.average_ms,
          max_ms: s.max_ms,
        }))
        .sort((a, b) => b.average_ms - a.average_ms),
    [stages],
  );

  if (data.length === 0) return null;

  const chartHeight = Math.max(data.length * 36 + 20, 120);

  return (
    <div className={className} style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, bottom: 0, left: 80 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            unit="ms"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }}
            axisLine={false}
            tickLine={false}
            width={75}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
            }}
            labelStyle={{ color: "var(--color-text-secondary)", marginBottom: "4px" }}
            formatter={(v: number, name: string) => [
              `${v.toFixed(1)}ms`,
              name === "average_ms" ? "Avg" : "Max",
            ]}
          />
          <Bar
            dataKey="average_ms"
            radius={[0, 3, 3, 0]}
            isAnimationActive={!prefersReduced}
            animationDuration={600}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={latencyColor(entry.average_ms)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
