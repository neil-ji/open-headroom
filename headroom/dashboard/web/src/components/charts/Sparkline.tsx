interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
}

export function Sparkline({ data, height = 32, className }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M${points} L${w},${height} L0,${height} Z`;
  const linePath = `M${points}`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TrendSparkline({ data, height = 64, valueKey }: {
  data: Record<string, unknown>[];
  height?: number;
  valueKey: string;
}) {
  const values = data.map((p) => (p[valueKey] as number) || 0);
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 200;

  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 8);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
    >
      <defs>
        <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pts} L${w},${height} L0,${height} Z`} fill="url(#trendGrad)" />
      <path d={`M${pts}`} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
    </svg>
  );
}
