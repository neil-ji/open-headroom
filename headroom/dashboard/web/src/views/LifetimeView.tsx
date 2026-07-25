import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { useLifetimeStats } from "@/hooks/useLifetimeStats";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/StatusBlock";
import { fmtNum, fmtCurrency } from "@/lib/format";

export function LifetimeView() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: ls } = useLifetimeStats(true);

  if (!ls) {
    return <LoadingBlock message={_t("Loading lifetime data…")} />;
  }

  const projects = Object.entries(ls.projects || {});

  return (
    <PageLayout
      title={_t("Lifetime")}
      description={_t("Cumulative savings across all sessions since") + " " + (ls.started_at || "—")}
    >
      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        {[
          [_t("Requests"), fmtNum(ls.requests?.total || 0), "var(--color-text)"],
          [_t("Failed"), fmtNum(ls.requests?.failed || 0), "var(--color-negative)"],
          [_t("Rate Limited"), fmtNum(ls.requests?.rate_limited || 0), "var(--color-warning)"],
          [_t("Cached"), fmtNum(ls.requests?.cached || 0), "var(--color-positive)"],
        ].map(([label, value, color]) => (
          <Card key={label as string}>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</div>
            <div className="text-2xl tabular-nums font-mono" style={{ color: color as string }}>{value}</div>
          </Card>
        ))}
      </div>

      <SectionHeader label={_t("Tokens & Cost")} />
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 text-sm" style={{ color: "var(--color-text)" }}>Tokens</h3>
          {[
            [_t("Input"), fmtNum(ls.tokens?.input || 0)],
            [_t("Output"), fmtNum(ls.tokens?.output || 0)],
            [_t("Attempted Input"), fmtNum(ls.tokens?.attempted_input || 0)],
            [_t("Saved"), fmtNum(ls.tokens?.saved || 0)],
            [_t("Token Savings"), ls.tokens?.token_savings_percent != null ? `${ls.tokens.token_savings_percent.toFixed(1)}%` : "—"],
          ].map(([label, value], i) => (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
              <span style={{ color: i === 3 ? "var(--color-positive)" : "var(--color-text)" }}>{value}</span>
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="mb-3 text-sm" style={{ color: "var(--color-text)" }}>Cost</h3>
          {[
            [_t("Input cost"), `$${fmtCurrency(ls.cost?.input_usd || 0)}`],
            [_t("Compression saved"), `$${fmtCurrency(ls.cost?.compression_savings_usd || 0)}`],
            [_t("Prefix Cache saved"), `$${fmtCurrency(ls.cost?.cache_savings_usd || 0)}`],
          ].map(([label, value], i) => (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
              <span style={{ color: i > 0 ? "var(--color-positive)" : "var(--color-text)" }}>{value}</span>
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="mb-3 text-sm" style={{ color: "var(--color-text)" }}>Prefix Cache</h3>
          {[
            [_t("Hits / requests"), `${fmtNum(ls.prefix_cache?.hit_requests || 0)} / ${fmtNum(ls.prefix_cache?.requests || 0)}`],
            [_t("Hit rate"), ls.prefix_cache?.cache_hit_rate != null ? `${ls.prefix_cache.cache_hit_rate.toFixed(1)}%` : "—"],
            [_t("Read / write"), `${fmtNum(ls.prefix_cache?.cache_read_tokens || 0)} / ${fmtNum(ls.prefix_cache?.cache_write_tokens || 0)}`],
            [_t("TTL 1h / 5m"), `${(ls.prefix_cache?.ttl_1h_percent != null ? ls.prefix_cache.ttl_1h_percent.toFixed(0) : "—")}% / ${(ls.prefix_cache?.ttl_5m_percent != null ? ls.prefix_cache.ttl_5m_percent.toFixed(0) : "—")}%`],
            [_t("Cache bust"), `${fmtNum(ls.prefix_cache?.bust_count || 0)} / ${fmtNum(ls.prefix_cache?.bust_tokens || 0)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Per-project savings */}
      {projects.length > 0 && (
        <>
          <SectionHeader label={_t("Per-Project Savings")} />
          <Card className="mb-6 overflow-hidden !p-0">
            <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {_t("Per-Project Savings")}
              </span>
              <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                {projects.length} {_t("project(s)")}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <th className="px-4 py-3 text-left font-medium">{_t("Project")}</th>
                    <th className="px-4 py-3 text-right font-medium">{_t("Requests")}</th>
                    <th className="px-4 py-3 text-right font-medium">{_t("Tokens Saved")}</th>
                    <th className="px-4 py-3 text-right font-medium">{_t("Saved $")}</th>
                    <th className="px-4 py-3 text-right font-medium">{_t("Savings")}</th>
                    <th className="px-4 py-3 text-right font-medium">{_t("Last Active")}</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(([name, info]) => (
                    <tr key={name} className="border-t hover:bg-[var(--color-surface-alt)]" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs font-mono rounded" style={{ background: "var(--color-surface-alt)" }}>{name}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{fmtNum(info.requests || 0)}</td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: "var(--color-accent)" }}>{fmtNum(info.tokens_saved || 0)}</td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: "var(--color-positive)" }}>${fmtCurrency(info.compression_savings_usd || 0)}</td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: "var(--color-accent)" }}>{(info.savings_percent || 0).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {info.last_activity_at ? new Date(info.last_activity_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Models and stacks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 text-sm" style={{ color: "var(--color-text)" }}>{_t("Providers")}</h3>
          {Object.entries(ls.requests?.by_provider || {}).map(([name, count]) => (
            <div key={name} className="flex justify-between text-sm">
              <span style={{ color: "var(--color-text-secondary)" }}>{name}</span>
              <span>{fmtNum(count as number)}</span>
            </div>
          ))}
          {Object.keys(ls.requests?.by_provider || {}).length === 0 && <EmptyState message={_t("No data")} />}
        </Card>
        <Card>
          <h3 className="mb-3 text-sm" style={{ color: "var(--color-text)" }}>{_t("Stacks")}</h3>
          {Object.entries(ls.requests?.by_stack || {}).map(([name, count]) => (
            <div key={name} className="flex justify-between text-sm">
              <span style={{ color: "var(--color-text-secondary)" }}>{name}</span>
              <span>{fmtNum(count as number)}</span>
            </div>
          ))}
          {Object.keys(ls.requests?.by_stack || {}).length === 0 && <EmptyState message={_t("No data")} />}
        </Card>
        <Card>
          <h3 className="mb-3 text-sm" style={{ color: "var(--color-text)" }}>{_t("Top Models")}</h3>
          {Object.entries(ls.by_model || {}).map(([name, m]) => (
            <div key={name} className="flex justify-between text-sm">
              <span className="truncate pr-3" style={{ color: "var(--color-text-secondary)" }}>{name}</span>
              <span>{fmtNum(m.input_tokens + m.output_tokens)}</span>
            </div>
          ))}
          {Object.keys(ls.by_model || {}).length === 0 && <EmptyState message={_t("No data")} />}
        </Card>
      </div>
    </PageLayout>
  );
}
