interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  fillColor?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  fillColor,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress-bar w-full" style={{ height: 6 }}>
      <div
        className="h-full rounded-sm transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: fillColor || "var(--color-accent)",
        }}
      />
    </div>
  );
}
