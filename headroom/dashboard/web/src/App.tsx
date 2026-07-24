import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Routes, Route, useSearchParams, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { LiveFeedDrawer } from "@/components/feed/LiveFeedDrawer";
import { SessionView } from "@/views/SessionView";
import { LifetimeView } from "@/views/LifetimeView";
import { HistoryView } from "@/views/HistoryView";
import { SettingsPage } from "@/views/SettingsPage";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { useStats, useHealth } from "@/hooks/useStats";
import { useTransformations } from "@/hooks/useTransformations";

export function App() {
  const { lang, toggleTheme } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const queryClient = useQueryClient();
  const [feedOpen, setFeedOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get("view") || "session";

  const { data: stats, dataUpdatedAt: statsUpdatedAt } = useStats();
  const { data: health } = useHealth();
  const { data: feedData } = useTransformations(feedOpen);

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

  // Keyboard shortcut: R to refresh all data
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        queryClient.invalidateQueries();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [queryClient]);

  const toggleFeed = useCallback(() => setFeedOpen((v) => !v), []);

  const version = useMemo(() => {
    const v = health?.version || "unknown";
    if (v === "loading" || v === "unknown") return v;
    return String(v).trim();
  }, [health?.version]);

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md"
        style={{ background: "var(--color-accent)", color: "#fff" }}
      >
        {_t("Skip to main content")}
      </a>

      <Header
        version={version}
        logFullMessages={stats?.log_full_messages ?? false}
        feedOpen={feedOpen}
        lastUpdated={statsUpdatedAt}
        onToggleFeed={toggleFeed}
        onToggleTheme={toggleTheme}
      />

      <Routes>
        <Route
          path="/dashboard"
          element={
            <Layout>
              {viewMode === "lifetime" ? (
                <LifetimeView />
              ) : viewMode === "history" ? (
                <HistoryView />
              ) : (
                <SessionView stats={stats} savingsHistory={savingsHistory.current} />
              )}
            </Layout>
          }
        />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <LiveFeedDrawer
        open={feedOpen}
        onClose={() => setFeedOpen(false)}
        transformations={feedData?.transformations || []}
      />

      {/* Footer */}
      <footer
        className="px-6 py-4 mt-8"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div
          className="flex justify-between items-center text-xs max-w-7xl mx-auto"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div>
            {_t("Press")}{" "}
            <kbd
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{
                background: "var(--color-surface-alt)",
                color: "var(--color-text-secondary)",
              }}
            >
              R
            </kbd>{" "}
            {_t("to refresh")}
          </div>
          <div>
            <a
              href="https://headroom-docs.vercel.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-text-muted)" }}
            >
              {_t("Documentation")}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
