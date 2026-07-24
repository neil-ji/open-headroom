interface CompressionMeterProps {
  percentage: number;
  isActive: boolean;
}

export function CompressionMeter({ percentage, isActive }: CompressionMeterProps) {
  const pct = Math.min(100, Math.max(0, percentage));
  const circumference = 2 * Math.PI * 23; // r=23
  const offset = circumference - (circumference * pct) / 100;

  return (
    <div className={`relative inline-flex items-center justify-center ${isActive ? "meter-pulse" : ""}`}>
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx="28" cy="28" r="23"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        {/* Glow ring */}
        <circle
          cx="28" cy="28" r="23"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity={isActive ? undefined : 0.15}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: "blur(4px)",
          }}
        />
        {/* Fill ring */}
        <circle
          cx="28" cy="28" r="23"
          fill="none"
          stroke="url(#meterGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="text-lg font-medium font-mono"
          style={{ color: "var(--color-accent)" }}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
