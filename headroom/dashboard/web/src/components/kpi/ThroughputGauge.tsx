import { useMemo } from "react";
import GaugeComponent from "react-gauge-component";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ThroughputGaugeProps {
  value: number;
  label: string;
  /** Absolute max for the gauge scale. Defaults to max(100, value * 2). */
  maxValue?: number;
  /** Sub-label text (e.g. "tok/s") shown below the value. */
  unit?: string;
  className?: string;
}

/** Sub-arc thresholds defined as fractions of maxValue. */
function subArcs(maxVal: number) {
  return [
    { limit: maxVal * 0.3, color: "#5BE12C" },
    { limit: maxVal * 0.7, color: "#F5CD19" },
    { color: "#EA4228" },
  ];
}

export function ThroughputGauge({
  value,
  label,
  maxValue,
  unit = "tok/s",
  className,
}: ThroughputGaugeProps) {
  const prefersReduced = useReducedMotion();
  const maxVal = useMemo(
    () => maxValue ?? Math.max(100, Math.ceil(value * 2)),
    [maxValue, value],
  );

  return (
    <div className={className} aria-label={`${label}: ${value.toFixed(0)} ${unit}`}>
      <GaugeComponent
        type="grafana"
        value={value}
        minValue={0}
        maxValue={maxVal}
        arc={{
          width: 0.25,
          padding: 0.02,
          subArcs: subArcs(maxVal),
        }}
        pointer={{
          type: "needle",
          elastic: !prefersReduced,
          animationDuration: prefersReduced ? 0 : 1500,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v: number) => v.toFixed(0),
            style: {
              fontSize: "28px",
              fill: "var(--color-text)",
              fontWeight: "bold",
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
            },
          },
          tickLabels: {
            type: "outer",
            defaultTickValueConfig: {
              formatTextValue: (v: number) => v.toFixed(0),
              style: { fontSize: "9px", fill: "var(--color-text-muted)" },
            },
          },
        }}
      />
      <p
        className="text-xs text-center mt-1 font-medium uppercase tracking-[0.12em]"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}

/** Compact variant for tight spaces. */
export function ThroughputGaugeCompact({
  value,
  label,
  maxValue,
  unit = "tok/s",
  className,
}: ThroughputGaugeProps) {
  const prefersReduced = useReducedMotion();
  const maxVal = useMemo(
    () => maxValue ?? Math.max(100, Math.ceil(value * 2)),
    [maxValue, value],
  );

  return (
    <div className={className} aria-label={`${label}: ${value.toFixed(0)} ${unit}`}>
      <GaugeComponent
        type="grafana"
        value={value}
        minValue={0}
        maxValue={maxVal}
        arc={{
          width: 0.22,
          padding: 0.015,
          subArcs: subArcs(maxVal),
        }}
        pointer={{
          type: "needle",
          elastic: !prefersReduced,
          animationDuration: prefersReduced ? 0 : 1000,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v: number) => v.toFixed(0),
            style: {
              fontSize: "24px",
              fill: "var(--color-text)",
              fontWeight: "bold",
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
            },
          },
          tickLabels: {
            type: "outer",
            defaultTickValueConfig: {
              formatTextValue: (v: number) => v.toFixed(0),
              style: { fontSize: "8px", fill: "var(--color-text-muted)" },
            },
          },
        }}
      />
      <p
        className="text-[10px] text-center mt-0.5 font-medium uppercase tracking-[0.12em]"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label} ({unit})
      </p>
    </div>
  );
}
