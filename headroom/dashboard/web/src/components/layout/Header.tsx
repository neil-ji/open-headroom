import { Sun, Moon, MessageSquareText } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { useHealth } from "@/hooks/useStats";
import { Select, Button } from "@spark-ui/components";

export function Header({
  logFullMessages,
  feedOpen,
  onToggleFeed,
  onToggleTheme,
}: {
  logFullMessages: boolean;
  feedOpen: boolean;
  onToggleFeed: () => void;
  onToggleTheme: () => void;
}) {
  const { lang, setLang } = useAppContext();
  const { data: health } = useHealth();
  const healthy = health?.status === "healthy";
  const _t = (key: string) => t(key, lang);

  const langOptions = [
    { value: "en", label: "EN" },
    { value: "zh", label: "中文" },
  ];

  return (
    <header
      className="glass-header sticky top-0 z-40 flex items-center justify-end gap-3 px-5 py-2"
    >
      {/* Status dot */}
      <span
        className="w-2 h-2 rounded-full pulse-live shrink-0"
        role="img"
        aria-label={healthy ? "Healthy" : "Error"}
        style={{
          background: healthy
            ? "var(--color-positive)"
            : "var(--color-negative)",
        }}
      />

      {/* Lang — fixed width to prevent stretching */}
      <div style={{ width: 112 }}>
        <Select
          options={langOptions}
          value={lang}
          onChange={(v) => setLang(v as "en" | "zh")}
          size="sm"
        />
      </div>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleTheme}
        aria-label={_t("Toggle light/dark mode")}
      >
        <Sun className="w-4 h-4 dark:hidden" />
        <Moon className="w-4 h-4 hidden dark:block" />
      </Button>

      {/* Live Feed */}
      {logFullMessages && (
        <Button
          variant={feedOpen ? "primary" : "secondary"}
          size="sm"
          onClick={onToggleFeed}
          leftIcon={<MessageSquareText className="w-4 h-4" />}
        >
          {_t("Feed")}
        </Button>
      )}
    </header>
  );
}
