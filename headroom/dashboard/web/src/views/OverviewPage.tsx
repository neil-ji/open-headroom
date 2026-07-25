import { PageLayout } from "@/components/layout/PageLayout";
import { KpiBar } from "@/components/kpi/KpiBar";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LoadingBlock } from "@/components/ui/StatusBlock";
import { useAppContext } from "@/context/AppContext";
import { useStats } from "@/hooks/useStats";
import { t } from "@/i18n/translations";
import { fmtNum } from "@/lib/format";

export function OverviewPage() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: stats } = useStats();

  if (!stats) {
    return <LoadingBlock message={_t("Loading session stats…")} />;
  }

  return (
    <PageLayout
      title={_t("Overview")}
      description={_t("Real-time proxy compression metrics · runtime counters reset on restart")}
    >
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
    </PageLayout>
  );
}
