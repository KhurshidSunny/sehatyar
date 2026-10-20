"use client";

import type { ReactNode } from "react";

import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import OfflineBanner from "@/components/OfflineBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

function ChromeBar() {
  return (
    <div className="border-b border-border bg-surface px-4 py-2.5 sm:px-6" dir="ltr">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
        <BrandLogo size="sm" priority />
        <LanguageSwitcher />
      </div>
    </div>
  );
}

/** Wraps the app with locale state and a global language control. */
export default function AppChrome({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ServiceWorkerRegister />
      <ChromeBar />
      <OfflineBanner />
      {children}
    </LocaleProvider>
  );
}
