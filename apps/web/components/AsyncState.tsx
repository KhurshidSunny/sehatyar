"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LoadingState() {
  const { t } = useLocale();
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="relative flex h-14 w-14 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-[3px] border-brand/20" />
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand border-r-brand" />
        <span className="h-3 w-3 animate-pulse rounded-full bg-brand" />
      </span>
      <p className="text-base text-muted sm:text-lg">{t("loading")}</p>
    </div>
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
