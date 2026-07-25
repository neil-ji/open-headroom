import { Card as SparkCard } from "@spark-ui/components";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/** Thin wrapper around spark-ui Card for backward compatibility. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SparkCard className={cn("mb-4", className)}>
      {children}
    </SparkCard>
  );
}

/** Inset sub-card with lighter background, used for nested stat groupings. */
export function CardInner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-lg border p-3", className)}
      style={{
        background: "var(--color-surface-alt)",
        borderColor: "var(--color-border-light)",
      }}
    >
      {children}
    </div>
  );
}
