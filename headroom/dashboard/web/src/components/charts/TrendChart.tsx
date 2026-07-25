import { useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fmtNum } from "@/lib/format";

interface TrendChartProps {
  data: Record<string, unknown>[];
  /** Key in data objects for the Y-axis value. */
  valueKey: string;
  /** Key in data objects for the X-axis label. Default: "ts". */
  timeKey?: string;
  height?: number;
  /** Optional formatter for tooltip values. Defaults to fmtNum. */
  formatValue?: (v: number) => string;
  /** Color for the line/area. Default: var(--color-accent). */
  color?: string;
  className?: string;
}

export function TrendChart({
  data,
  valueKey,
  timeKey = "ts",
  height = 200,
  formatValue = fmtNum,
  color = "var(--color-accent)",
  className,
}: TrendChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const prefersReduced = useReducedMotion();

  if (!data || data.length < 2) return null;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data as Record<string, unknown>[]}
          margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey={timeKey}
            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={50}
            tickFormatter={formatValue}
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
            formatter={(v: number) => [formatValue(v), (data[0] as Record<string, unknown>)?.[`${valueKey}_label`] as string || valueKey]}
          />
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke={color}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive={!prefersReduced}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
