import { EmptyState as SparkEmptyState } from "@spark-ui/components";
import type { ReactNode } from "react";

/** Wrapper around spark-ui EmptyState for backward compatibility. */
export function EmptyState({ message }: { message: string }) {
  return <SparkEmptyState description={message} size="sm" />;
}

/** Compact metric label — used above KPI values. */
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
