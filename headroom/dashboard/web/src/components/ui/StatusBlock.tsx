import { Spinner } from "./Spinner";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";

export function LoadingBlock({ message }: { message?: string }) {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-text-muted)",
      }}
    >
      <Spinner size={28} />
      <p className="text-sm">{message || _t("loading")}</p>
    </div>
  );
}

export function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12"
      style={{
        borderColor: "var(--color-negative)",
        color: "var(--color-text-muted)",
      }}
    >
      <p className="text-sm" style={{ color: "var(--color-negative)" }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            background: "var(--color-surface-alt)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          }}
        >
          {_t("Retry")}
        </button>
      )}
    </div>
  );
}
