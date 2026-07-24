import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="px-4 py-5 md:px-6 md:py-6 max-w-7xl mx-auto">
      {children}
    </main>
  );
}
