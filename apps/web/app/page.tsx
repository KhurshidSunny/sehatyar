"use client";

import Link from "next/link";

import Disclaimer from "@/components/Disclaimer";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Home() {
  const { t } = useLocale();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-xl text-center">
          <p className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
            {t("brandName")}
          </p>
          <p className="mt-3 text-base text-muted sm:text-lg">{t("tagline")}</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">{t("whatDoYouWant")}</p>

        <Link
          href="/faqs"
          className="flex min-h-20 w-full items-center justify-center rounded-2xl bg-brand px-6 py-5 text-center text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
        >
          {t("healthQuestions")}
        </Link>

        <Link
          href="/medicines"
          className="flex min-h-20 w-full items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-5 text-center text-xl font-semibold text-brand shadow-sm transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
        >
          {t("whatIsThisMedicine")}
        </Link>
      </main>

      <Disclaimer />
    </div>
  );
}
