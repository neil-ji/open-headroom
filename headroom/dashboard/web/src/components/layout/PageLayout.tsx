import type { ReactNode } from "react";

interface PageLayoutProps {
  /** Page heading — rendered as <h1> if provided. */
  title?: string;
  /** Subtitle / description shown below the title. */
  description?: string;
  /** Additional content rendered between description and children (e.g. version info, banners). */
  headerExtra?: ReactNode;
  /** Additional CSS classes for the root element. */
  className?: string;
  /** Page body content. */
  children: ReactNode;
}

/**
 * Unified page layout for all dashboard views.
 * Provides consistent margins, max-width, scroll behaviour, and optional title area.
 */
export function PageLayout({ title, description, headerExtra, className, children }: PageLayoutProps) {
  const cn = (...args: (string | undefined)[]) => args.filter(Boolean).join(" ");
  return (
    <div
      className={cn("px-4 py-5 md:px-6 md:py-6 max-w-7xl mx-auto w-full", className)}
      id="main-content"
    >
      {(title || description || headerExtra) && (
        <header className="mb-6">
          {title && (
            <h1 className="text-xl font-bold mb-1">{title}</h1>
          )}
          {description && (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {description}
            </p>
          )}
          {headerExtra}
        </header>
      )}
      {children}
    </div>
  );
}
