import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { useHistoryStats } from "@/hooks/useHistoryStats";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/StatusBlock";
import { TrendSparkline } from "@/components/charts/Sparkline";
import { fmtNum, fmtCurrency, fmtDate, truncateModel } from "@/lib/format";
import { Tabs, Tab, TabList, Button } from "@spark-ui/components";

type Granularity = "daily" | "weekly" | "monthly" | "history";

export function HistoryView() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: hs } = useHistoryStats(true);
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [exporting, setExporting] = useState<string | null>(null);

  if (!hs) {
    return <LoadingBlock message={_t("Loading history…")} />;
  }

  const hasData = (hs.history || []).length > 0;
  const series = granularity === "history"
    ? hs.history || []
    : hs.series?.[granularity] || [];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {_t("Historical Proxy Compression")}
          </h2>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {_t("Durable local savings history")}
          </div>
        </div>
        <div className="flex gap-2">
          {[
            ["JSON", "json"],
            ["CSV", "csv"],
          ].map(([label, fmt]) => (
            <Button
              key={fmt}
              variant="secondary"
              size="sm"
              disabled={exporting !== null}
              onClick={async () => {
                setExporting(fmt);
                try {
                  const res = await fetch(`/stats-history?format=${fmt}&series=${granularity}`);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `headroom-stats-history-${granularity}.${fmt}`;
                  a.click();
                  URL.revokeObjectURL(url);
                } finally {
                  setExporting(null);
                }
              }}
            >
              {exporting === fmt ? _t("Exporting…") : _t(`Export ${label}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {[
          [_t("Lifetime Compression Savings"), `$${fmtCurrency(hs.lifetime?.compression_savings_usd || 0)}`, "var(--color-positive)"],
          [_t("Lifetime Tokens Saved"), fmtNum(hs.lifetime?.tokens_saved || 0), "var(--color-accent)"],
          [_t("Active Days"), fmtNum((hs.series?.daily || []).length), "var(--color-text)"],
          [_t("Average Saved / Day"), fmtNum(Math.round((hs.lifetime?.tokens_saved || 0) / Math.max((hs.series?.daily || []).length, 1))), "var(--color-text)"],
          [_t("Average Saved / Week"), fmtNum(Math.round((hs.lifetime?.tokens_saved || 0) / Math.max((hs.series?.weekly || []).length, 1))), "var(--color-text)"],
        ].map(([label, value, color]) => (
          <Card key={label as string}>
            <div className="text-xs font-medium uppercase tracking-[0.12em] mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</div>
            <div className="text-3xl font-light tabular-nums font-mono" style={{ color: color as string }}>{value}</div>
          </Card>
        ))}
      </div>

      {!hasData ? (
        <Card className="p-10 text-center">
          <div className="text-lg mb-2" style={{ color: "var(--color-text)" }}>
            {_t("No persisted savings history yet")}
          </div>
          <p className="text-sm max-w-2xl mx-auto" style={{ color: "var(--color-text-muted)" }}>
            {_t("Historical data is written locally after proxy requests save tokens. Keep using Headroom and this view will fill in automatically across restarts.")}
          </p>
        </Card>
      ) : (
        <>
          {/* Granularity tabs — using spark-ui Tabs */}
          <Tabs value={granularity} onChange={(v) => setGranularity(v as Granularity)} className="mb-4">
            <TabList>
              <Tab value="daily">{_t("Daily")}</Tab>
              <Tab value="weekly">{_t("Weekly")}</Tab>
              <Tab value="monthly">{_t("Monthly")}</Tab>
              <Tab value="history">{_t("Checkpoints")}</Tab>
            </TabList>
          </Tabs>

          {/* Trend chart */}
          <SectionHeader label={_t("Historical Savings Trend")} />
          {series.length >= 2 ? (
            <Card className="mb-6">
              <div className="h-48">
                <TrendSparkline data={series as unknown as Record<string, unknown>[]} valueKey="total_tokens_saved" height={96} />
              </div>
            </Card>
          ) : (
            <EmptyState message={_t("Need more data points for trend.")} />
          )}

          {/* Recent checkpoints */}
          <SectionHeader label={_t("Recent Checkpoints")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...(hs.history || [])].slice(-8).reverse().map((point) => (
              <Card key={point.timestamp} className="flex items-center justify-between">
                <div>
                  <div className="text-sm" style={{ color: "var(--color-text)" }}>{fmtDate(point.timestamp)}</div>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{_t("Cumulative proxy compression savings")}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm" style={{ color: "var(--color-accent)" }}>
                    {fmtNum(point.total_tokens_saved)} {_t("tokens")}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-positive)" }}>
                    ${fmtCurrency(point.compression_savings_usd || 0)}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <SectionHeader label={_t("Historical Summary")} />
          <Card>
            <div className="space-y-3">
              {[
                [_t("Latest total"), `${fmtNum(hs.lifetime?.tokens_saved || 0)} ${_t("tokens")}`],
                [_t("Selected points"), String(series.length)],
                [_t("Retention"), `${hs.retention?.max_history_age_days || 0}d / ${fmtNum(hs.retention?.max_history_points || 0)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                  <span className="font-mono text-sm">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
