"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Permanent non-prescribing notice shown on every user-facing screen. */
export default function Disclaimer() {
  const { t } = useLocale();

  return (
    <aside
      className="border-t-2 border-disclaimer-border bg-disclaimer-bg px-4 py-4 sm:px-6"
      role="note"
      aria-label={t("disclaimer")}
    >
      <p className="mx-auto max-w-xl text-center text-base font-medium leading-relaxed text-disclaimer-text sm:text-lg">
        {t("disclaimer")}
      </p>
    </aside>
  );
}
