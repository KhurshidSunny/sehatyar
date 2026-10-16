"use client";

import type { ReactNode } from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LocaleProvider, useLocale } from "@/lib/i18n/LocaleProvider";

function ChromeBar() {
  const { t } = useLocale();

  return (
    <div className="border-b border-border bg-surface px-4 py-2 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted sm:text-base">{t("language")}</p>
        <LanguageSwitcher />
      </div>
    </div>
  );
}

/** Wraps the app with locale state and a global language control. */
export default function AppChrome({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ChromeBar />
      {children}
    </LocaleProvider>
  );
}
