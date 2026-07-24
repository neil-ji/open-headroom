import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import type { Transformation } from "@/types/api";
import { fmtNum } from "@/lib/format";

interface LiveFeedDrawerProps {
  open: boolean;
  onClose: () => void;
  transformations: Transformation[];
}

function escHtml(s: string) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function TransformationCard({ tr }: { tr: Transformation }) {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  const msgs = (tr.request_messages || []).map((m) => m.content || "").join("");
  const resp = tr.response_content || "";
  const hasContent = msgs.length > 0 || resp.length > 0;
  const before = msgs.substring(0, 2000) + (msgs.length > 2000 ? `\n\n${_t("[truncated]")}` : "");
  const after = resp.substring(0, 2000) + (resp.length > 2000 ? `\n\n${_t("[truncated]")}` : "");
  const empty = `<span style="color:var(--color-text-muted);font-style:italic">${escHtml(_t("Enable HEADROOM_LOG_MESSAGES=true to see content"))}</span>`;

  return (
    <div
      className="border-b p-3"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface-alt)",
        height: 160,
        boxSizing: "border-box",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono truncate" style={{ color: "var(--color-text-secondary)" }}>
            {escHtml((tr.model || _t("unknown")).substring(0, 25))}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--color-positive)" }}>
            {fmtNum(tr.tokens_saved || 0)} tok
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            ({(tr.savings_percent || 0).toFixed(0)}%)
          </span>
        </div>
        <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
          {tr.timestamp ? new Date(tr.timestamp).toLocaleTimeString() : "--:--:--"}
        </span>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-2 gap-2" style={{ height: 115 }}>
        <div className="rounded border flex flex-col overflow-hidden" style={{ borderColor: "var(--diff-before-border)" }}>
          <div className="px-2 py-1 border-b shrink-0" style={{ borderColor: "var(--diff-before-border)", background: "var(--diff-before-header)" }}>
            <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--color-negative)" }}>{_t("Before")}</span>
          </div>
          <div
            className="p-2 font-mono text-xs overflow-auto flex-1"
            style={{ background: "var(--diff-before-body)", color: "var(--color-text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: hasContent ? escHtml(before) : empty }}
          />
        </div>
        <div className="rounded border flex flex-col overflow-hidden" style={{ borderColor: "var(--diff-after-border)" }}>
          <div className="px-2 py-1 border-b shrink-0" style={{ borderColor: "var(--diff-after-border)", background: "var(--diff-after-header)" }}>
            <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--color-positive)" }}>{_t("After")}</span>
          </div>
          <div
            className="p-2 font-mono text-xs overflow-auto flex-1"
            style={{ background: "var(--diff-after-body)", color: "var(--color-text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: hasContent ? escHtml(after) : empty }}
          />
        </div>
      </div>
    </div>
  );
}

export function LiveFeedDrawer({ open, onClose, transformations }: LiveFeedDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);

  if (!open) return null;

  return (
    <div
      className="fixed top-0 right-0 h-full w-[min(520px,100vw)] z-50 flex flex-col shadow-2xl"
      style={{
        background: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {_t("Message Transformations")}
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: "var(--color-text-muted)" }}
          >
            {transformations.length} {_t("msgs")}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          aria-label={_t("Close feed")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {transformations.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            {_t("No transformations yet.")}
          </div>
        ) : (
          transformations.map((t, i) => <TransformationCard key={i} tr={t} />)
        )}
      </div>
    </div>
  );
}
