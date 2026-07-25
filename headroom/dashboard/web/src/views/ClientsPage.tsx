import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardInner } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { LoadingBlock } from "@/components/ui/StatusBlock";
import { useAppContext } from "@/context/AppContext";
import { useStats } from "@/hooks/useStats";
import { t } from "@/i18n/translations";
import { fmtNum } from "@/lib/format";

// ── Agent dot colors ──
const AGENT_COLORS: Record<string, string> = {
  "claude-code": "var(--color-agent-claude)",
  claude: "var(--color-agent-claude)",
  codex: "var(--color-agent-codex)",
  cursor: "var(--color-agent-cursor)",
  copilot: "var(--color-agent-copilot)",
  openai: "var(--color-agent-openai)",
  anthropic: "var(--color-agent-claude)",
  gemini: "var(--color-agent-gemini)",
  aider: "var(--color-agent-aider)",
};

export function ClientsPage() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const { data: stats } = useStats();

  if (!stats) {
    return <LoadingBlock message={_t("Loading session stats…")} />;
  }

  // Agent usage rows
  const agentRows = stats.agent_usage?.agents || [];

  return (
    <PageLayout
      title={_t("Clients")}
      description={_t("Detected AI clients and their token usage before and after compression")}
    >
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
                {_t("Before and after token usage by detected client")}
              </div>
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>
              {fmtNum(stats.agent_usage?.totals?.requests || 0)} requests
            </span>
          </div>
          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              [_t("Before"), stats.agent_usage?.totals?.before_tokens || 0, true],
              [_t("After"), stats.agent_usage?.totals?.after_tokens || 0, true],
              [_t("Saved"), stats.agent_usage?.totals?.tokens_saved || 0, true],
              [_t("Savings"), `${(stats.agent_usage?.totals?.savings_percent || 0).toFixed(1)}%`, false],
            ].map(([label, value, animate], i) => (
              <CardInner key={i}>
                <div
                  className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </div>
                {animate ? (
                  <AnimatedNumber
                    className="text-2xl font-light tabular-nums font-mono"
                    style={{
                      color: i >= 2 ? "var(--color-accent)" : "var(--color-text)",
                    }}
                    value={value as number}
                  />
                ) : (
                  <div
                    className="text-2xl font-light tabular-nums font-mono"
                    style={{
                      color: i === 3 ? "var(--color-positive)" : "var(--color-text)",
                    }}
                  >
                    {value as string}
                  </div>
                )}
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
                          role="img"
                          aria-label={agent.label}
                          style={{
                            background: AGENT_COLORS[agent.agent] || "var(--color-agent-default)",
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
                          {(agent.savings_percent || 0).toFixed(1)}{_t("% saved")}
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
    </PageLayout>
  );
}
