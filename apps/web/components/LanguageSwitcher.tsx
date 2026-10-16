"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/messages";

const OPTIONS: { value: Locale; labelKey: "languagePs" | "languageEn" }[] = [
  { value: "ps", labelKey: "languagePs" },
  { value: "en", labelKey: "languageEn" },
];

/** Pashto / English control — app content follows the chosen language only. */
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sehatyar-language" className="sr-only">
        {t("language")}
      </label>
      <select
        id="sehatyar-language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="min-h-11 min-w-[7.5rem] rounded-xl border-2 border-border bg-surface px-3 py-2 text-base font-semibold text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label={t("language")}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
