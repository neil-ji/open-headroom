export function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-2">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--color-accent)" }}
      />
      <h2
        className="text-xs font-medium uppercase tracking-[0.12em]"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </h2>
      <hr
        className="flex-1 border-0"
        style={{ height: 1, background: "var(--color-border)" }}
      />
    </div>
  );
}
