import type { ReactNode } from "react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border border-dashed p-8 text-center"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-text-muted)",
      }}
    >
      <p className="text-sm italic">{message}</p>
    </div>
  );
}

export function StatLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
      style={{ color: "var(--color-text-muted)" }}
    >
      {children}
    </div>
  );
}
