import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LoadingBlock } from "@/components/ui/StatusBlock";
import { useAppContext } from "@/context/AppContext";
import { useStats } from "@/hooks/useStats";
import { t } from "@/i18n/translations";
import { fmtNum, fmtCurrency } from "@/lib/format";

export function PerformancePage() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: stats } = useStats();

  if (!stats) {
    return <LoadingBlock message={_t("Loading session stats…")} />;
  }

  // Cache active check
  const cacheActive = (stats.prefix_cache?.totals?.requests || 0) > 0;

  return (
    <PageLayout
      title={_t("Performance")}
      description={_t("Proxy overhead, throughput, pipeline timing, and cache efficiency")}
    >
      {/* ── Section: Performance ── */}
      <SectionHeader label={_t("Performance")} />
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
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
        </Card>

        <Card>
          <div
            className="text-xs font-medium uppercase tracking-[0.12em] mb-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {_t("Throughput")}
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            {[
              [
                _t("Input (wall / active p50)"),
                `${(stats.throughput?.rolling?.input_wall_clock || 0).toFixed(1)} / ${(stats.throughput?.rolling?.input_active_p50 || 0).toFixed(1)}`,
                "var(--color-accent)",
              ],
              [
                _t("Forward (p50 / p95)"),
                `${(stats.throughput?.rolling?.forward_p50 || 0).toFixed(1)} / ${(stats.throughput?.rolling?.forward_p95 || 0).toFixed(1)}`,
                "var(--color-throughput-forward)",
              ],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-[var(--color-border)] pb-0.5">
                <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                <span className="font-mono" style={{ color: color as string }}>
                  {value} {_t("tok/s")}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium mb-4" style={{ color: "var(--color-text)" }}>
            {_t("Performance")}
          </h3>
          <div className="space-y-3">
            {[
              [
                _t("Overhead Range"),
                `${(stats.overhead?.min_ms || 0).toFixed(0)} - ${(stats.overhead?.max_ms || 0).toFixed(0)}ms`,
              ],
              [
                _t("TTFB Range"),
                `${((stats.ttfb?.min_ms || 0) / 1000).toFixed(2)} - ${((stats.ttfb?.max_ms || 0) / 1000).toFixed(2)}s`,
              ],
              [_t("Failed Requests"), String(stats.requests?.failed || 0)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {label}
                </span>
                <span className="font-mono text-sm">{value}</span>
              </div>
            ))}
            {/* Pipeline breakdown */}
            {Object.keys(stats.pipeline_timing || {}).length > 0 && (
              <div>
                <hr className="my-2" style={{ borderColor: "var(--color-border)" }} />
                <div
                  className="text-xs font-medium uppercase tracking-[0.12em] mb-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {_t("Pipeline Breakdown")}
                </div>
                {Object.entries(stats.pipeline_timing || {}).map(([name, t]) => (
                  <div key={name} className="flex justify-between items-center mb-1">
                    <span
                      className="text-xs font-mono truncate mr-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {name}
                    </span>
                    <span
                      className="text-xs font-mono whitespace-nowrap"
                      style={{
                        color:
                          t.average_ms > 100
                            ? "var(--color-pipeline-slow)"
                            : t.average_ms > 50
                              ? "var(--color-pipeline-medium)"
                              : "var(--color-text-secondary)",
                      }}
                    >
                      {t.average_ms.toFixed(0)}ms avg / {t.max_ms.toFixed(0)}ms max
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
