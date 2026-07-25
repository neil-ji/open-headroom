import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Routes, Route, useSearchParams, useLocation, Navigate, NavLink } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LiveFeedDrawer } from "@/components/feed/LiveFeedDrawer";
import { SessionView } from "@/views/SessionView";
import { LifetimeView } from "@/views/LifetimeView";
import { HistoryView } from "@/views/HistoryView";
import { SettingsPage } from "@/views/SettingsPage";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { useStats, useHealth } from "@/hooks/useStats";
import { useTransformations } from "@/hooks/useTransformations";
import { Sidebar, SidebarGroup, SidebarMenu, SidebarMenuItem } from "@spark-ui/components";

export function App() {
  const { lang, toggleTheme } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const queryClient = useQueryClient();
  const [feedOpen, setFeedOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
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

  // Active sidebar state
  const isSettingsPage = location.pathname === "/dashboard/settings";
  const currentView = isSettingsPage ? "" : viewMode;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md"
        style={{ background: "var(--color-accent)", color: "#fff" }}
      >
        {_t("Skip to main content")}
      </a>

      {/* Sidebar navigation */}
      <Sidebar width={220}>
        {/* Brand area */}
        <div className="flex items-center gap-2.5 px-3 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--color-accent)" }}
          >
            <rect x="3" y="4" width="4" height="16" rx="1.5" fill="currentColor" opacity="0.9" />
            <rect x="9" y="7" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.65" />
            <rect x="15" y="2" width="4" height="20" rx="1.5" fill="currentColor" opacity="0.4" />
          </svg>
          <span className="text-sm font-bold tracking-tight whitespace-nowrap" style={{ color: "var(--color-text)" }}>
            HEADROOM
          </span>
        </div>

        <SidebarGroup label={_t("Dashboard")}>
          <SidebarMenu>
            <SidebarMenuItem
              icon="chart"
              label={_t("Session")}
              active={!isSettingsPage && currentView === "session"}
              as={NavLink}
              to="/dashboard"
            />
            <SidebarMenuItem
              icon="hourglass"
              label={_t("Lifetime")}
              active={!isSettingsPage && currentView === "lifetime"}
              as={NavLink}
              to="/dashboard?view=lifetime"
            />
            <SidebarMenuItem
              icon="document"
              label={_t("History")}
              active={!isSettingsPage && currentView === "history"}
              as={NavLink}
              to="/dashboard?view=history"
            />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup label={_t("Settings")}>
          <SidebarMenu>
            <SidebarMenuItem
              icon="gear"
              label={_t("Settings")}
              active={isSettingsPage}
              as={NavLink}
              to="/dashboard/settings"
            />
          </SidebarMenu>
        </SidebarGroup>
      </Sidebar>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        <Header
          logFullMessages={stats?.log_full_messages ?? false}
          feedOpen={feedOpen}
          onToggleFeed={toggleFeed}
          onToggleTheme={toggleTheme}
        />

        <Routes>
          <Route
            path="/dashboard"
            element={
              viewMode === "lifetime" ? (
                <LifetimeView />
              ) : viewMode === "history" ? (
                <HistoryView />
              ) : (
                <SessionView stats={stats} savingsHistory={savingsHistory.current} />
              )
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
      </div>
    </div>
  );
}
