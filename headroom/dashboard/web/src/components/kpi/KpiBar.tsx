import { CompressionMeter } from "./CompressionMeter";
import { StatLabel } from "@/components/ui/EmptyState";
import type { StatsResponse } from "@/types/api";
import { fmtNum } from "@/lib/format";

interface KpiBarProps {
  stats: StatsResponse;
}

export function KpiBar({ stats }: KpiBarProps) {
  const savingsPct = stats.tokens?.savings_percent ?? 0;
  const totalTokens = stats.tokens?.saved ?? 0;
  const totalRequests = stats.requests?.total ?? 0;
  const failedRequests = stats.requests?.failed ?? 0;
  const overheadMs = stats.overhead?.average_ms ?? 0;
  const ttfbSec = ((stats.ttfb?.average_ms ?? 0) / 1000).toFixed(2);
  const outputTokens = stats.tokens?.output ?? 0;
  const outputPct = stats.tokens?.output_reduction_percent ?? 0;
  const throughput = stats.throughput?.rolling?.input_wall_clock ?? 0;
  const fwdThroughput = stats.throughput?.rolling?.forward_p50 ?? 0;
  const isActive = totalTokens > 0;

  return (
    <div
      className="px-5 py-4 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center rounded-[14px]"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Compression Meter */}
      <div className="flex items-center gap-3 col-span-2 md:col-span-1">
        <CompressionMeter percentage={savingsPct} isActive={isActive} />
        <div>
          <StatLabel>Token Savings</StatLabel>
          <div
            className="text-xl font-mono"
            style={{ color: "var(--color-text)" }}
          >
            {fmtNum(totalTokens)}
          </div>
        </div>
      </div>
      {/* Requests */}
      <div className="text-center md:text-left">
        <StatLabel>Requests</StatLabel>
        <div
          className="text-lg font-mono"
          style={{ color: "var(--color-text)" }}
        >
          {fmtNum(totalRequests)}
        </div>
        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span style={{ color: "var(--color-negative)" }}>
            {fmtNum(failedRequests)} failed
          </span>
        </div>
      </div>
      {/* Overhead */}
      <div className="text-center md:text-left">
        <StatLabel>Overhead</StatLabel>
        <div
          className="text-lg font-mono"
          style={{ color: "var(--color-text)" }}
        >
          {overheadMs.toFixed(0)}ms
        </div>
        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          TTFB {ttfbSec}s
        </div>
      </div>
      {/* Output Tokens */}
      <div className="text-center md:text-left">
        <StatLabel>Output Tokens</StatLabel>
        <div
          className="text-lg font-mono"
          style={{ color: "var(--color-text)" }}
        >
          {fmtNum(outputTokens)}
        </div>
        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {stats.tokens?.output_reduction?.available && (
            <span style={{ color: "var(--color-positive)" }}>
              {outputPct.toFixed(1)}% saved
            </span>
          )}
        </div>
      </div>
      {/* Throughput */}
      <div className="text-center md:text-left hidden lg:block">
        <StatLabel>Throughput</StatLabel>
        <div
          className="text-lg font-mono"
          style={{ color: "var(--color-text)" }}
        >
          {throughput.toFixed(0)}{" "}
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            tok/s
          </span>
        </div>
        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {fwdThroughput.toFixed(0)} fwd tok/s
        </div>
      </div>
    </div>
  );
}
