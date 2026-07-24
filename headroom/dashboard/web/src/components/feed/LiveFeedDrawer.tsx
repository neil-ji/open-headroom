import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
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

function TransformationCard({ t }: { t: Transformation }) {
  const msgs = (t.request_messages || []).map((m) => m.content || "").join("");
  const resp = t.response_content || "";
  const hasContent = msgs.length > 0 || resp.length > 0;
  const before = msgs.substring(0, 2000) + (msgs.length > 2000 ? "\n\n[truncated]" : "");
  const after = resp.substring(0, 2000) + (resp.length > 2000 ? "\n\n[truncated]" : "");
  const empty = '<span style="color:var(--color-text-muted);font-style:italic">Enable HEADROOM_LOG_MESSAGES=true to see content</span>';

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
            {escHtml((t.model || "unknown").substring(0, 25))}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--color-positive)" }}>
            {fmtNum(t.tokens_saved || 0)} tok
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            ({(t.savings_percent || 0).toFixed(0)}%)
          </span>
        </div>
        <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
          {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "--:--:--"}
        </span>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-2 gap-2" style={{ height: 115 }}>
        <div className="rounded border flex flex-col overflow-hidden" style={{ borderColor: "rgba(196,78,78,0.25)" }}>
          <div className="px-2 py-1 border-b shrink-0" style={{ borderColor: "rgba(196,78,78,0.25)", background: "var(--diff-before-header, #1A0A0A)" }}>
            <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-negative)" }}>Before</span>
          </div>
          <div
            className="p-2 font-mono text-[11px] overflow-auto flex-1"
            style={{ background: "var(--diff-before-body, #140808)", color: "var(--color-text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: hasContent ? escHtml(before) : empty }}
          />
        </div>
        <div className="rounded border flex flex-col overflow-hidden" style={{ borderColor: "rgba(61,139,126,0.25)" }}>
          <div className="px-2 py-1 border-b shrink-0" style={{ borderColor: "rgba(61,139,126,0.25)", background: "var(--diff-after-header, #0A1A14)" }}>
            <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-positive)" }}>After</span>
          </div>
          <div
            className="p-2 font-mono text-[11px] overflow-auto flex-1"
            style={{ background: "var(--diff-after-body, #081410)", color: "var(--color-text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: hasContent ? escHtml(after) : empty }}
          />
        </div>
      </div>
    </div>
  );
}

export function LiveFeedDrawer({ open, onClose, transformations }: LiveFeedDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return (
    <div
      className="fixed top-0 right-0 h-full w-[520px] z-50 flex flex-col shadow-2xl"
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
            Message Transformations
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: "var(--color-text-muted)" }}
          >
            {transformations.length} msgs
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {transformations.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            No transformations yet.
          </div>
        ) : (
          transformations.map((t, i) => <TransformationCard key={i} t={t} />)
        )}
      </div>
    </div>
  );
}
