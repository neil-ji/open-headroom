import { Card as SparkCard } from "@spark-ui/components";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/** Thin wrapper around spark-ui Card for backward compatibility, with optional entrance animation. */
export function Card({
  children,
  className,
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  /** Enable whileInView fade-in animation. Default true. */
  animate?: boolean;
}) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 16 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={animate ? { once: true, margin: "-50px" } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <SparkCard className={cn("mb-4", className)}>
        {children}
      </SparkCard>
    </motion.div>
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
