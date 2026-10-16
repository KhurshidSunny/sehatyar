"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LoadingState() {
  const { t } = useLocale();
  return (
    <p
      className="rounded-2xl border-2 border-border bg-surface px-5 py-8 text-center text-lg text-muted"
      role="status"
    >
      {t("loading")}
    </p>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useLocale();
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-8 text-center"
      role="alert"
    >
      <p className="text-lg text-muted sm:text-xl">{t("loadError")}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-12 min-w-[10rem] rounded-xl bg-brand px-5 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {t("retry")}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border-2 border-border bg-surface px-5 py-8 text-center text-lg text-muted">
      {message}
    </p>
  );
}
