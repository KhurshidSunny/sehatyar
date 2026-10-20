"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Shown when FAQ content was loaded from the offline pack instead of the API. */
export default function CachedContentBadge({ visible }: { visible: boolean }) {
  const { t } = useLocale();

  if (!visible) {
    return null;
  }

  return (
    <span
      className="inline-flex w-fit items-center rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-muted"
      role="status"
    >
      {t("cachedContentBadge")}
    </span>
  );
}
