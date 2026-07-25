import { useRef, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/StatusBlock";
import { Sparkline, TrendSparkline } from "@/components/charts/Sparkline";
import { useAppContext } from "@/context/AppContext";
import { useStats } from "@/hooks/useStats";
import { t } from "@/i18n/translations";
import { fmtNum } from "@/lib/format";

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
  json_bloat: "var(--color-waste-json)",
  html_noise: "var(--color-waste-html)",
  base64: "var(--color-waste-base64)",
  whitespace: "var(--color-waste-whitespace)",
  dynamic_date: "var(--color-waste-date)",
  repetition: "var(--color-waste-repetition)",
  reread: "var(--color-waste-reread)",
  reread_compressed: "var(--color-waste-reread-compressed)",
};

function wasteLabel(s: string) {
  return WASTE_LABELS[s] || s;
}

export function SavingsPage() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: stats } = useStats();

  // Track savings history for sparkline
  const savingsHistory = useRef<number[]>([]);
  useEffect(() => {
    if (stats?.tokens?.saved !== undefined) {
      savingsHistory.current.push(stats.tokens.saved);
      if (savingsHistory.current.length > 30) {
        savingsHistory.current.shift();
      }
    }
  }, [stats?.tokens?.saved]);

  if (!stats) {
    return <LoadingBlock message={_t("Loading session stats…")} />;
  }

  // Sorted waste signals
  const sortedWaste = Object.entries(stats.waste_signals || {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);
  const maxWaste = Math.max(...sortedWaste.map(([, v]) => v), 1);

  return (
    <PageLayout
      title={_t("Savings")}
      description={_t("Token savings breakdown, waste signals, and savings trends")}
    >
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
            {_t("Proxy")} {fmtNum(stats.tokens?.proxy_compression_saved || 0)} {_t("tokens")}
            {" · "}
            {_t("Of total wire:")} {(stats.tokens?.savings_percent || 0).toFixed(2)}%
          </div>
          <div className="mt-3 h-8">
            <Sparkline data={savingsHistory.current} />
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
            <EmptyState message={_t("Enable the output shaper (HEADROOM_OUTPUT_SHAPER=1) and run headroom learn --verbosity --apply to start measuring.")} />
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
              {fmtNum((stats.savings?.by_layer?.tool_search?.requests as number) || 0)} {_t("calls · tool schemas deferred")}
            </div>
          </Card>
        )}
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
              [_t("Proxy Removed"), fmtNum(stats.tokens?.proxy_compression_saved || 0)],
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
            <EmptyState message={_t("No waste signals detected yet. Data appears after requests are processed.")} />
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
          {savingsHistory.current.length >= 2 ? (
            <div className="h-32">
              <TrendSparkline
                data={savingsHistory.current.map((v, i) => ({ i, v }))}
                valueKey="v"
                height={64}
              />
            </div>
          ) : (
            <EmptyState message={_t("Trend data will appear after multiple requests.")} />
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
