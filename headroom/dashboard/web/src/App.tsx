import { useState, useCallback, useMemo, useEffect } from "react";
import { Routes, Route, useSearchParams, useLocation, Navigate, NavLink } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LiveFeedDrawer } from "@/components/feed/LiveFeedDrawer";
import { OverviewPage } from "@/views/OverviewPage";
import { SavingsPage } from "@/views/SavingsPage";
import { PerformancePage } from "@/views/PerformancePage";
import { ClientsPage } from "@/views/ClientsPage";
import { ActivityPage } from "@/views/ActivityPage";
import { LifetimeView } from "@/views/LifetimeView";
import { HistoryView } from "@/views/HistoryView";
import { SettingsPage } from "@/views/SettingsPage";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { useStats, useHealth } from "@/hooks/useStats";
import { useTransformations } from "@/hooks/useTransformations";
import { Sidebar, SidebarGroup, SidebarMenu, SidebarMenuItem } from "@spark-ui/components";

/** Redirect old ?view= query-param URLs to proper routes */
function LegacyRedirect() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");
  if (view === "lifetime") return <Navigate to="/dashboard/lifetime" replace />;
  if (view === "history") return <Navigate to="/dashboard/history" replace />;
  return <OverviewPage />;
}

export function App() {
  const { lang, toggleTheme } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const queryClient = useQueryClient();
  const [feedOpen, setFeedOpen] = useState(false);
  const location = useLocation();

  const { data: stats, reconnect: reconnectStats } = useStats();
  const { data: health } = useHealth();
  const { data: feedData } = useTransformations(feedOpen);

  // Keyboard shortcut: R to refresh all data
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        reconnectStats();
        queryClient.invalidateQueries({ queryKey: ["health"] });
        queryClient.invalidateQueries({ queryKey: ["transformations"] });
        queryClient.invalidateQueries({ queryKey: ["historyStats"] });
        queryClient.invalidateQueries({ queryKey: ["lifetimeStats"] });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [queryClient, reconnectStats]);

  const toggleFeed = useCallback(() => setFeedOpen((v) => !v), []);

  const version = useMemo(() => {
    const v = health?.version || "unknown";
    if (v === "loading" || v === "unknown") return v;
    return String(v).trim();
  }, [health?.version]);

  // Active sidebar state — match by pathname prefix
  const isActive = (path: string) => location.pathname === path;

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
        <div className="flex items-center gap-2.5 px-3 py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <svg
            className="w-7 h-7 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--color-accent)" }}
          >
            <rect x="3" y="4" width="4" height="16" rx="1.5" fill="currentColor" opacity="0.9" />
            <rect x="9" y="7" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.65" />
            <rect x="15" y="2" width="4" height="20" rx="1.5" fill="currentColor" opacity="0.4" />
          </svg>
          <span className="text-sm font-bold tracking-tight whitespace-nowrap" style={{ color: "var(--color-text)" }}>
            OPEN-HEADROOM
          </span>
        </div>

        <SidebarGroup label={_t("Dashboard")}>
          <SidebarMenu>
            <SidebarMenuItem
              icon="chart"
              label={_t("Overview")}
              active={isActive("/dashboard")}
              as={NavLink}
              to="/dashboard"
            />
            <SidebarMenuItem
              icon="download"
              label={_t("Savings")}
              active={isActive("/dashboard/savings")}
              as={NavLink}
              to="/dashboard/savings"
            />
            <SidebarMenuItem
              icon="zap"
              label={_t("Performance")}
              active={isActive("/dashboard/performance")}
              as={NavLink}
              to="/dashboard/performance"
            />
            <SidebarMenuItem
              icon="bot"
              label={_t("Clients")}
              active={isActive("/dashboard/clients")}
              as={NavLink}
              to="/dashboard/clients"
            />
            <SidebarMenuItem
              icon="task-list"
              label={_t("Activity Log")}
              active={isActive("/dashboard/activity")}
              as={NavLink}
              to="/dashboard/activity"
            />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup label={_t("History")}>
          <SidebarMenu>
            <SidebarMenuItem
              icon="hourglass"
              label={_t("Lifetime")}
              active={isActive("/dashboard/lifetime")}
              as={NavLink}
              to="/dashboard/lifetime"
            />
            <SidebarMenuItem
              icon="document"
              label={_t("History")}
              active={isActive("/dashboard/history")}
              as={NavLink}
              to="/dashboard/history"
            />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup label={_t("Settings")}>
          <SidebarMenu>
            <SidebarMenuItem
              icon="gear"
              label={_t("Settings")}
              active={isActive("/dashboard/settings")}
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
          <Route path="/dashboard" element={<LegacyRedirect />} />
          <Route path="/dashboard/savings" element={<SavingsPage />} />
          <Route path="/dashboard/performance" element={<PerformancePage />} />
          <Route path="/dashboard/clients" element={<ClientsPage />} />
          <Route path="/dashboard/activity" element={<ActivityPage />} />
          <Route path="/dashboard/lifetime" element={<LifetimeView />} />
          <Route path="/dashboard/history" element={<HistoryView />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <LiveFeedDrawer
          open={feedOpen}
          onClose={() => setFeedOpen(false)}
          transformations={feedData?.transformations || []}
        />

      </div>
    </div>
  );
}
