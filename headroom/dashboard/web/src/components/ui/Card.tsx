import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("card p-4", className)}>{children}</div>;
}

export function CardInner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        className,
      )}
      style={{
        background: "var(--color-surface-alt)",
        borderColor: "var(--color-border-light)",
      }}
    >
      {children}
    </div>
  );
}
