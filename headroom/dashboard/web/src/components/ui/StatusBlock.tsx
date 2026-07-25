import { Skeleton, Alert, Button } from "@spark-ui/components";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";

export function LoadingBlock({ message }: { message?: string }) {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton variant="card" height="120px" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
        {message || _t("loading")}
      </p>
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
    <Alert variant="danger" title={message}>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          {_t("Retry")}
        </Button>
      )}
    </Alert>
  );
}
