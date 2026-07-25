import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ThroughputGauge, ThroughputGaugeCompact } from "@/components/kpi/ThroughputGauge";
import { PipelineBarChart } from "@/components/charts/PipelineBarChart";
import { useAppContext } from "@/context/AppContext";
import { useStats } from "@/hooks/useStats";
import { t } from "@/i18n/translations";
import { fmtNum, fmtCurrency } from "@/lib/format";

export function PerformancePage() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: stats } = useStats();

  if (!stats) return null;

  const cacheActive = (stats.prefix_cache?.totals?.requests || 0) > 0;
  const pipelineStages = Object.entries(stats.pipeline_timing || {}).map(
    ([name, t]) => ({ name, average_ms: t.average_ms, max_ms: t.max_ms }),
  );

  return (
    <PageLayout
      title={_t("Performance")}
      description={_t("Proxy overhead, throughput, pipeline timing, and cache efficiency")}
    >
      {/* ── Section: Performance ── */}
      <SectionHeader label={_t("Performance")} />
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
        {/* Overhead Card */}
        <Card>
          <div
            className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {_t("Overhead")}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light tabular-nums font-mono">
              {(stats.overhead?.average_ms || 0).toFixed(0)}ms
            </span>
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            TTFB {((stats.ttfb?.average_ms || 0) / 1000).toFixed(2)}s avg
          </div>
          <div className="mt-3 text-xs space-y-1">
            <div className="flex justify-between" style={{ color: "var(--color-text-secondary)" }}>
              <span>{_t("Range")}</span>
              <span className="font-mono">
                {(stats.overhead?.min_ms || 0).toFixed(0)}–{(stats.overhead?.max_ms || 0).toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between" style={{ color: "var(--color-text-secondary)" }}>
              <span>{_t("TTFB Range")}</span>
              <span className="font-mono">
                {((stats.ttfb?.min_ms || 0) / 1000).toFixed(2)}–{((stats.ttfb?.max_ms || 0) / 1000).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between" style={{ color: "var(--color-text-secondary)" }}>
              <span>{_t("Failed")}</span>
              <span className="font-mono" style={{ color: "var(--color-negative)" }}>
                {stats.requests?.failed || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Throughput Gauge Card */}
        <Card className="flex flex-col items-center">
          <div
            className="text-xs font-medium uppercase tracking-[0.12em] mb-2 self-start"
            style={{ color: "var(--color-text-muted)" }}
          >
            {_t("Throughput")}
          </div>
          <div className="w-full max-w-[240px]">
            <ThroughputGaugeCompact
              value={stats.throughput?.rolling?.input_wall_clock || 0}
              label={_t("Input")}
              unit="tok/s"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] w-full">
            {[
              [_t("Forward p50"), `${(stats.throughput?.rolling?.forward_p50 || 0).toFixed(1)}`, "var(--color-throughput-forward)"],
              [_t("Forward p95"), `${(stats.throughput?.rolling?.forward_p95 || 0).toFixed(1)}`, "var(--color-throughput-forward)"],
              [_t("Compression p50"), `${(stats.throughput?.rolling?.compression_p50 || 0).toFixed(1)}`, "var(--color-accent)"],
              [_t("Generation p50"), `${(stats.throughput?.rolling?.generation_p50 || 0).toFixed(1)}`, "var(--color-text)"],
            ].map(([l, v, c]) => (
              <div key={l as string} className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>{l}</span>
                <span className="font-mono" style={{ color: c as string }}>{v} tok/s</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pipeline Timing Chart */}
        <Card>
          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--color-text)" }}>
            {_t("Pipeline Breakdown")}
          </h3>
          {pipelineStages.length > 0 ? (
            <PipelineBarChart stages={pipelineStages} />
          ) : (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {_t("No pipeline timing data yet.")}
            </p>
          )}
        </Card>
      </div>

      {/* ── Section: Cache & Efficiency ── */}
      <SectionHeader label={_t("Cache & Efficiency")} />
      {cacheActive && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {_t("Prefix Cache Impact")}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--color-positive)" }}>
              {_t("Net savings:")} ${fmtCurrency(stats.prefix_cache?.totals?.net_savings_usd || 0)}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              [
                _t("Cache Writes"),
                fmtNum(stats.prefix_cache?.totals?.cache_write_tokens || 0),
                "var(--color-warning)",
                `$${fmtCurrency(stats.prefix_cache?.totals?.write_premium_usd || 0)} ${_t("write premium")}`,
              ],
              [
                _t("Hit Rate"),
                `${(stats.prefix_cache?.totals?.hit_rate || 0).toFixed(0)}%`,
                (stats.prefix_cache?.totals?.hit_rate || 0) > 80
                  ? "var(--color-positive)"
                  : (stats.prefix_cache?.totals?.hit_rate || 0) > 50
                    ? "var(--color-warning)"
                    : "var(--color-negative)",
                `${stats.prefix_cache?.totals?.hit_requests || 0} / ${stats.prefix_cache?.totals?.requests || 0} requests`,
              ],
              [
                _t("Cache Busts"),
                String(stats.prefix_cache?.totals?.bust_count || 0),
                (stats.prefix_cache?.totals?.bust_count || 0) > 5
                  ? "var(--color-negative)"
                  : (stats.prefix_cache?.totals?.bust_count || 0) > 0
                    ? "var(--color-warning)"
                    : "var(--color-positive)",
                `${fmtNum(stats.prefix_cache?.totals?.bust_write_tokens || 0)} ${_t("tokens re-written")}`,
              ],
              [
                _t("Providers"),
                String(Object.keys(stats.prefix_cache?.by_provider || {}).length),
                "var(--color-text)",
                _t("with cache data"),
              ],
            ].map(([label, value, color, subtitle]) => (
              <div key={label as string}>
                <div
                  className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </div>
                <div className="text-2xl font-light tabular-nums font-mono" style={{ color: color as string }}>
                  {value}
                </div>
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {subtitle}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
