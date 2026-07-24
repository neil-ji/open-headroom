import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Routes, Route, useSearchParams, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { LiveFeedDrawer } from "@/components/feed/LiveFeedDrawer";
import { SessionView } from "@/views/SessionView";
import { LifetimeView } from "@/views/LifetimeView";
import { HistoryView } from "@/views/HistoryView";
import { SettingsPage } from "@/views/SettingsPage";
import { useAppContext } from "@/context/AppContext";
import { useStats, useHealth } from "@/hooks/useStats";
import { useTransformations } from "@/hooks/useTransformations";

export function App() {
  const { toggleTheme } = useAppContext();
  const [feedOpen, setFeedOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get("view") || "session";

  const { data: stats } = useStats();
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

  const toggleFeed = useCallback(() => setFeedOpen((v) => !v), []);

  const version = useMemo(() => {
    const v = health?.version || "unknown";
    if (v === "loading" || v === "unknown") return v;
    return String(v).trim();
  }, [health?.version]);

  return (
    <>
      <Header
        version={version}
        logFullMessages={stats?.log_full_messages ?? false}
        feedOpen={feedOpen}
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
            Press{" "}
            <kbd
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{
                background: "var(--color-surface-alt)",
                color: "var(--color-text-secondary)",
              }}
            >
              R
            </kbd>{" "}
            to refresh
          </div>
          <div>
            <a
              href="https://headroom-docs.vercel.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-text-muted)" }}
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
