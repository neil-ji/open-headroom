import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/StatusBlock";
import { useAppContext } from "@/context/AppContext";
import { useStats } from "@/hooks/useStats";
import { t } from "@/i18n/translations";
import { fmtNum, fmtTimeAgo, truncateModel } from "@/lib/format";

export function ActivityPage() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: stats } = useStats();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!stats) {
    return <LoadingBlock message={_t("Loading session stats…")} />;
  }

  return (
    <PageLayout
      title={_t("Activity Log")}
      description={_t("Recent proxy requests with detailed per-request metrics")}
    >
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
            {_t("last 25 — click row to expand")}
          </span>
        </div>
        {/* Scroll wrapper for mobile */}
        <div className="overflow-x-auto">
        {/* Table header */}
        <div
          className="grid text-xs font-medium uppercase tracking-wide px-4 py-3 min-w-[640px]"
          style={{
            gridTemplateColumns: "2rem 12fr 22fr 15fr 12fr 10fr 14fr",
            color: "var(--color-text-muted)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: "var(--color-surface)",
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
            <EmptyState message={_t("No requests yet. Start using the proxy to see activity here.")} />
          </div>
        ) : (
          (stats.recent_requests || []).map((req) => (
            <div key={req.request_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div
                className="grid cursor-pointer hover:bg-[var(--color-surface-alt)] px-4 py-3 text-sm min-w-[640px]"
                style={{ gridTemplateColumns: "2rem 12fr 22fr 15fr 12fr 10fr 14fr" }}
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [req.request_id]: !prev[req.request_id],
                  }))
                }
              >
                <div style={{ color: "var(--color-text-muted)" }} aria-label={expanded[req.request_id] ? _t("Collapse") : _t("Expand")}>
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
                      [_t("Original Tokens"), fmtNum(req.input_tokens_original)],
                      [_t("Compressed Tokens"), fmtNum(req.input_tokens_optimized)],
                      [_t("Tokens Removed"), fmtNum(req.tokens_saved)],
                      [_t("Optimization Time"), `${(req.optimization_latency_ms || 0).toFixed(0)}ms`],
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
        </div>{/* /overflow-x-auto */}
      </Card>
    </PageLayout>
  );
}
