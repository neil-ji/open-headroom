import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Sun, Moon, MessageSquareText, SettingsIcon } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { useHealth } from "@/hooks/useStats";

export function Header({
  version,
  logFullMessages,
  feedOpen,
  onToggleFeed,
  onToggleTheme,
}: {
  version: string;
  logFullMessages: boolean;
  feedOpen: boolean;
  onToggleFeed: () => void;
  onToggleTheme: () => void;
}) {
  const { lang, setLang } = useAppContext();
  const { data: health } = useHealth();
  const healthy = health?.status === "healthy";

  const _t = (key: string) => t(key, lang);

  return (
    <header className="glass-header sticky top-0 z-40 px-5 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "var(--color-accent)" }}
            >
              <rect x="3" y="4" width="4" height="16" rx="1.5" fill="currentColor" opacity="0.9" />
              <rect x="9" y="7" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.65" />
              <rect x="15" y="2" width="4" height="20" rx="1.5" fill="currentColor" opacity="0.4" />
            </svg>
            <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              HEADROOM
            </h1>
          </div>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{
              color: "var(--color-text-muted)",
              background: "var(--color-surface-alt)",
            }}
          >
            {version ? `v${version}` : "loading"}
          </span>
        </div>

        {/* Right: controls */}
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-4">
          {/* View tabs */}
          <div
            className="inline-flex rounded-[10px] p-0.5 gap-0.5"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-alt)",
            }}
          >
            {[
              ["/dashboard", _t("Session")],
              ["/dashboard?view=lifetime", _t("Lifetime")],
              ["/dashboard?view=history", _t("Historical")],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm rounded-md transition-colors font-medium ${
                    isActive
                      ? "text-white"
                      : ""
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: "var(--color-accent)" }
                    : { color: "var(--color-text-secondary)" }
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full pulse-live"
              role="img"
              aria-label={healthy ? _t("Healthy") : _t("Error")}
              style={{
                background: healthy
                  ? "var(--color-positive)"
                  : "var(--color-negative)",
              }}
            />
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {healthy ? _t("Healthy") : _t("Error")}
            </span>
          </div>

          {/* Lang switcher */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "en" | "zh")}
            className="text-xs rounded-md px-2 py-2.5 focus:outline-none"
            aria-label={_t("Language")}
            style={{
              color: "var(--color-text-secondary)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <option value="en">EN</option>
            <option value="zh">中文</option>
          </select>

          {/* Settings */}
          <NavLink
            to="/dashboard/settings"
            className="p-2.5 rounded-md transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label={_t("Settings")}
          >
            <SettingsIcon className="w-5 h-5" />
          </NavLink>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-md transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label={_t("Toggle light/dark mode")}
          >
            <Sun className="w-5 h-5 dark:hidden" />
            <Moon className="w-5 h-5 hidden dark:block" />
          </button>

          {/* Live Feed */}
          {logFullMessages && (
            <button
              onClick={onToggleFeed}
              className="px-3 py-2.5 text-sm rounded-md transition-all font-medium"
              style={
                feedOpen
                  ? { background: "var(--color-accent)", color: "#fff" }
                  : {
                      color: "var(--color-text-secondary)",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              <MessageSquareText className="w-4 h-4 inline mr-1.5" />
              Live Feed
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
