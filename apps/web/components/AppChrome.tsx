"use client";

import type { ReactNode } from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

function ChromeBar() {
  return (
    <div className="border-b border-border bg-surface px-4 py-2 sm:px-6" dir="ltr">
      <div className="mx-auto flex w-full max-w-xl items-center justify-end">
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
