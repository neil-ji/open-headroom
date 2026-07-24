import { useState } from "react";
import { KpiBar } from "@/components/kpi/KpiBar";
import { Card, CardInner } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkline, TrendSparkline } from "@/components/charts/Sparkline";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { fmtNum, fmtCurrency, truncateModel, fmtTimeAgo } from "@/lib/format";
import type { StatsResponse } from "@/types/api";

// ── Waste signal helpers ──
const WASTE_LABELS: Record<string, string> = {
  json_bloat: "JSON Bloat",
  html_noise: "HTML Noise",
  base64: "Base64 Blobs",
  whitespace: "Whitespace",
  dynamic_date: "Dynamic Dates",
  repetition: "Repetition",
  reread: "Re-read Tool Results",
  reread_compressed: "Re-read After Compression",
};
const WASTE_COLORS: Record<string, string> = {
  json_bloat: "var(--color-warning)",
  html_noise: "#f97316",
  base64: "var(--color-negative)",
  whitespace: "#3b82f6",
  dynamic_date: "#a78bfa",
  repetition: "#ec4899",
  reread: "#14b8a6",
  reread_compressed: "#f43f5e",
};

function wasteLabel(s: string) {
  return WASTE_LABELS[s] || s;
}

// ── Agent dot colors ──
const AGENT_COLORS: Record<string, string> = {
  "claude-code": "#f97316",
  claude: "#f97316",
  codex: "#10b981",
  cursor: "#06b6d4",
  copilot: "#8b5cf6",
  openai: "#0ea5e9",
  anthropic: "#f97316",
  gemini: "#f43f5e",
  aider: "#f59e0b",
};

interface SessionViewProps {
  stats?: StatsResponse;
  savingsHistory: number[];
}

export function SessionView({ stats, savingsHistory }: SessionViewProps) {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "var(--color-text-muted)" }}>
        Loading...
      </div>
    );
  }

  // Cache active check
  const cacheActive = (stats.prefix_cache?.totals?.requests || 0) > 0;

  // Sorted waste signals
  const sortedWaste = Object.entries(stats.waste_signals || {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const maxWaste = Math.max(...sortedWaste.map(([, v]) => v), 1);

  // Agent usage rows
  const agentRows = stats.agent_usage?.agents || [];

  return (
    <div>
      <p className="mb-5 text-xs" style={{ color: "var(--color-text-muted)" }}>
        Current proxy process · runtime counters reset on restart
      </p>

      {/* ── Hero KPI Bar ── */}
      <KpiBar stats={stats} />

      {/* ── Section: Overview ── */}
      <SectionHeader label={_t("Overview")} />
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {_t("Request Health")}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              [_t("Completed"), fmtNum(stats.requests?.total || 0), "var(--color-text)"],
              [_t("Failed"), fmtNum(stats.requests?.failed || 0), "var(--color-negative)"],
              [_t("Rate Limited"), fmtNum(stats.requests?.rate_limited || 0), "var(--color-warning)"],
              [_t("Cached"), fmtNum(stats.requests?.cached || 0), "var(--color-positive)"],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                <span className="float-right tabular-nums font-mono" style={{ color: color as string }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {_t("Live Activity")}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              [_t("Active Requests"), fmtNum(stats.proxy_inbound?.active || 0)],
              [_t("Active WebSockets"), fmtNum(stats.runtime?.websocket_sessions?.active_sessions || 0)],
              [_t("Relay Tasks"), fmtNum(stats.runtime?.websocket_sessions?.active_relay_tasks || 0)],
              [_t("Compression Queued"), fmtNum(stats.runtime?.compression_executor?.queued || 0)],
            ].map(([label, value]) => (
              <div key={label as string}>
                <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                <span className="float-right tabular-nums font-mono">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Section: Savings Breakdown ── */}
      <SectionHeader label={_t("Savings Breakdown")} />
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Token Savings */}
        <Card>
          <div
            className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {_t("Token Savings")}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light tabular-nums font-mono" style={{ color: "var(--color-accent)" }}>
              {fmtNum(stats.tokens?.saved || 0)}
            </span>
            <span className="text-sm" style={{ color: "var(--color-accent)" }}>
              {(stats.tokens?.savings_percent || 0).toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Proxy {fmtNum(stats.tokens?.proxy_compression_saved || 0)} tokens
            {" · "}
            {_t("Of total wire:")} {(stats.tokens?.savings_percent || 0).toFixed(2)}%
          </div>
          <div className="mt-3 h-8">
            <Sparkline data={savingsHistory} />
          </div>
        </Card>

        {/* Output Tokens Saved */}
        <Card>
          <div
            className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {_t("Output Tokens Saved")}
          </div>
          {stats.tokens?.output_reduction?.available ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light tabular-nums font-mono" style={{ color: "var(--color-accent)" }}>
                  {fmtNum(stats.tokens?.output_saved || 0)}
                </span>
                <span className="text-sm" style={{ color: "var(--color-accent)" }}>
                  {(stats.tokens?.output_reduction_percent || 0).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <span
                  className="uppercase"
                  style={{
                    color:
                      stats.tokens?.output_reduction?.method === "measured"
                        ? "var(--color-positive)"
                        : "var(--color-text-muted)",
                  }}
                >
                  {stats.tokens?.output_reduction?.method || ""}
                </span>
                {" · 95% CI "}
                {(stats.tokens?.output_reduction?.ci_low_percent || 0).toFixed(1)}–
                {(stats.tokens?.output_reduction?.ci_high_percent || 0).toFixed(1)}%
              </div>
            </>
          ) : (
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span className="text-2xl font-light">—</span>
              <div className="mt-1">
                Enable the output shaper (HEADROOM_OUTPUT_SHAPER=1) and run{" "}
                <code>headroom learn --verbosity --apply</code> to start measuring.
              </div>
            </div>
          )}
        </Card>

        {/* Tool-Schema Deferral */}
        {((stats.savings?.by_layer?.tool_search?.tokens as number) || 0) > 0 && (
          <Card>
            <div
              className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              {_t("Tool-Schema Deferral")}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light tabular-nums font-mono" style={{ color: "var(--color-positive)" }}>
                {fmtNum((stats.savings?.by_layer?.tool_search?.tokens as number) || 0)}
              </span>
              <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                tokens
              </span>
            </div>
            <div className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {fmtNum((stats.savings?.by_layer?.tool_search?.requests as number) || 0)} calls · tool schemas deferred
            </div>
          </Card>
        )}
      </div>

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
                "Input (wall / active p50)",
                `${(stats.throughput?.rolling?.input_wall_clock || 0).toFixed(1)} / ${(stats.throughput?.rolling?.input_active_p50 || 0).toFixed(1)}`,
                "var(--color-accent)",
              ],
              [
                "Forward (p50 / p95)",
                `${(stats.throughput?.rolling?.forward_p50 || 0).toFixed(1)} / ${(stats.throughput?.rolling?.forward_p95 || 0).toFixed(1)}`,
                "#06b6d4",
              ],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between border-b border-[var(--color-border)] pb-0.5">
                <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                <span className="font-mono" style={{ color: color as string }}>
                  {value} tok/s
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
                            ? "var(--color-warning)"
                            : t.average_ms > 50
                              ? "#eab308"
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

      {/* ── Section: Token Flow ── */}
      <SectionHeader label={_t("Token Flow")} />
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-sm font-medium mb-4" style={{ color: "var(--color-text)" }}>
            {_t("Token Usage")}
          </h3>
          <div className="space-y-3">
            {[
              [_t("Before Compression"), fmtNum(stats.tokens?.total_before_compression || 0)],
              ["Proxy Removed", fmtNum(stats.tokens?.proxy_compression_saved || 0)],
              [_t("After Compression (sent)"), fmtNum(stats.tokens?.input || 0)],
              [_t("Output Tokens"), fmtNum(stats.tokens?.output || 0)],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {label}
                </span>
                <span
                  className="font-mono text-sm"
                  style={{
                    color: i === 1 ? "var(--color-accent)" : "var(--color-text)",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium mb-4" style={{ color: "var(--color-text)" }}>
            {_t("What Headroom Removed")}
          </h3>
          {sortedWaste.length === 0 ? (
            <EmptyState message="No waste signals detected yet. Data appears after requests are processed." />
          ) : (
            <div className="space-y-3">
              {sortedWaste.map(([signal, tokens]) => (
                <div key={signal}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {wasteLabel(signal)}
                    </span>
                    <span className="font-mono text-sm" style={{ color: "var(--color-accent)" }}>
                      {fmtNum(tokens as number)} tokens
                    </span>
                  </div>
                  <ProgressBar
                    value={tokens as number}
                    max={maxWaste}
                    fillColor={WASTE_COLORS[signal] || "var(--color-accent)"}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {_t("Savings Over Time")}
            </span>
          </div>
          {savingsHistory.length >= 2 ? (
            <div className="h-32">
              <TrendSparkline
                data={savingsHistory.map((v, i) => ({ i, v }))}
                valueKey="v"
                height={64}
              />
            </div>
          ) : (
            <EmptyState message="Trend data will appear after multiple requests." />
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
              Net savings: ${fmtCurrency(stats.prefix_cache?.totals?.net_savings_usd || 0)}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              [
                _t("Cache Writes"),
                fmtNum(stats.prefix_cache?.totals?.cache_write_tokens || 0),
                "var(--color-warning)",
                `$${fmtCurrency(stats.prefix_cache?.totals?.write_premium_usd || 0)} write premium`,
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
                `${fmtNum(stats.prefix_cache?.totals?.bust_write_tokens || 0)} tokens re-written`,
              ],
              [
                _t("Providers"),
                String(Object.keys(stats.prefix_cache?.by_provider || {}).length),
                "var(--color-text)",
                "with cache data",
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

      {/* ── Section: Clients & Models ── */}
      <SectionHeader label={_t("Clients & Models")} />
      {agentRows.length > 0 && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {_t("Agent Usage")}
              </h3>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Before and after token usage by detected client
              </div>
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>
              {fmtNum(stats.agent_usage?.totals?.requests || 0)} requests
            </span>
          </div>
          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              [_t("Before"), fmtNum(stats.agent_usage?.totals?.before_tokens || 0)],
              [_t("After"), fmtNum(stats.agent_usage?.totals?.after_tokens || 0)],
              [_t("Saved"), fmtNum(stats.agent_usage?.totals?.tokens_saved || 0)],
              [_t("Savings"), `${(stats.agent_usage?.totals?.savings_percent || 0).toFixed(1)}%`],
            ].map(([label, value], i) => (
              <CardInner key={i}>
                <div
                  className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </div>
                <div
                  className="text-2xl font-light tabular-nums font-mono"
                  style={{
                    color: i >= 2 ? "var(--color-accent)" : i === 3 ? "var(--color-positive)" : "var(--color-text)",
                  }}
                >
                  {value}
                </div>
              </CardInner>
            ))}
          </div>
          {/* Agent rows */}
          <div className="space-y-3">
            {agentRows.map((agent) => {
              const savedWidth =
                agent.before_tokens > 0
                  ? Math.min(100, Math.max(0, ((agent.tokens_saved || 0) / agent.before_tokens) * 100))
                  : 0;
              const afterWidth =
                agent.before_tokens > 0
                  ? Math.min(100, Math.max(0, ((agent.after_tokens || 0) / agent.before_tokens) * 100))
                  : 0;
              return (
                <CardInner key={agent.agent}>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(160px,0.9fr)_minmax(260px,1.5fr)_minmax(260px,1.2fr)] lg:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full inline-block"
                          style={{
                            background: AGENT_COLORS[agent.agent] || "#9ca3af",
                          }}
                        />
                        <span className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                          {agent.label}
                        </span>
                      </div>
                      <div className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {fmtNum(agent.requests || 0)} requests · {agent.source}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: "var(--color-text-muted)" }}>
                          {_t("Token flow")}
                        </span>
                        <span className="font-mono" style={{ color: "var(--color-positive)" }}>
                          {(agent.savings_percent || 0).toFixed(1)}% saved
                        </span>
                      </div>
                      <div className="progress-bar w-full flex" style={{ height: 12 }}>
                        <div
                          className="h-full transition-all"
                          style={{ width: `${savedWidth}%`, background: "var(--color-positive)" }}
                        />
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${afterWidth}%`,
                            background: "var(--color-accent)",
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-right">
                      {[
                        [_t("Before"), fmtNum(agent.before_tokens || 0)],
                        [_t("After"), fmtNum(agent.after_tokens || 0)],
                        [_t("Saved"), fmtNum(agent.tokens_saved || 0)],
                        [_t("Share"), `${(agent.share_of_saved_percent || 0).toFixed(1)}%`],
                      ].map(([label, value]) => (
                        <div key={label as string}>
                          <div
                            className="text-[11px] uppercase tracking-wide"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {label}
                          </div>
                          <div className="font-mono text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardInner>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Section: Activity Log ── */}
      <SectionHeader label={_t("Activity Log")} />
      <Card className="mb-6 overflow-hidden !p-0">
        <div
          className="px-4 py-3 flex justify-between items-center"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {_t("Recent Requests")}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            last 25 — click row to expand
          </span>
        </div>
        {/* Table header */}
        <div
          className="grid text-xs font-medium uppercase tracking-wide px-4 py-3"
          style={{
            gridTemplateColumns: "2rem 12fr 22fr 15fr 12fr 10fr 14fr",
            color: "var(--color-text-muted)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div />
          <div>{_t("Time")}</div>
          <div>{_t("Model")}</div>
          <div className="text-right">{_t("Input")}</div>
          <div className="text-right">{_t("Output")}</div>
          <div className="text-right">{_t("Saved")}</div>
          <div className="text-right">{_t("Latency")}</div>
        </div>
        {(stats.recent_requests || []).length === 0 ? (
          <div className="p-8">
            <EmptyState message="No requests yet. Start using the proxy to see activity here." />
          </div>
        ) : (
          (stats.recent_requests || []).map((req) => (
            <div key={req.request_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div
                className="grid cursor-pointer hover:bg-[var(--color-surface-alt)] px-4 py-3 text-sm"
                style={{ gridTemplateColumns: "2rem 12fr 22fr 15fr 12fr 10fr 14fr" }}
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [req.request_id]: !prev[req.request_id],
                  }))
                }
              >
                <div style={{ color: "var(--color-text-muted)" }}>
                  {expanded[req.request_id] ? "−" : "+"}
                </div>
                <div className="font-mono truncate" style={{ color: "var(--color-text-secondary)" }}>
                  {fmtTimeAgo(req.timestamp)}
                </div>
                <div className="min-w-0">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{ background: "var(--color-surface-alt)" }}
                  >
                    {truncateModel(req.model)}
                  </span>
                </div>
                <div className="text-right font-mono tabular-nums">
                  {fmtNum(req.input_tokens_optimized)}
                </div>
                <div className="text-right font-mono tabular-nums">
                  {fmtNum(req.output_tokens || 0)}
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums" style={{ color: "var(--color-accent)" }}>
                    {req.savings_percent.toFixed(0)}%
                  </span>
                </div>
                <div
                  className="text-right font-mono tabular-nums"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {(req.total_latency_ms || 0).toFixed(0)}ms
                </div>
              </div>
              {/* Expanded detail */}
              {expanded[req.request_id] && (
                <div
                  className="px-8 py-4"
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    background: "var(--color-surface-alt)",
                  }}
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {[
                      ["Original Tokens", fmtNum(req.input_tokens_original)],
                      ["Compressed Tokens", fmtNum(req.input_tokens_optimized)],
                      ["Tokens Removed", fmtNum(req.tokens_saved)],
                      ["Optimization Time", `${(req.optimization_latency_ms || 0).toFixed(0)}ms`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div
                          className="uppercase tracking-wide mb-1"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {label}
                        </div>
                        <div className="font-mono">{value}</div>
                      </div>
                    ))}
                  </div>
                  {req.transforms_applied?.length > 0 && (
                    <div className="mt-3">
                      <div
                        className="uppercase tracking-wide mb-1 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {_t("Transforms Applied")}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {req.transforms_applied.map((tr) => (
                          <span
                            key={tr}
                            className="px-2 py-0.5 rounded text-xs font-mono"
                            style={{ background: "var(--color-border)" }}
                          >
                            {tr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
