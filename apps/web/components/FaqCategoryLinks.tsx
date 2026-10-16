"use client";

import Link from "next/link";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { FaqCategory } from "@/lib/types";

export default function FaqCategoryLinks({ categories }: { categories: FaqCategory[] }) {
  const { locale, t } = useLocale();

  return (
    <>
      <p className="text-center text-lg text-muted sm:text-xl">{t("chooseCategory")}</p>
      <ul className="flex flex-col gap-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/faqs/${category.id}`}
              className="flex min-h-16 w-full flex-col justify-center rounded-2xl border-2 border-border bg-surface px-5 py-4 shadow-sm transition hover:border-brand hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="text-xl font-semibold text-foreground sm:text-2xl">
                {locale === "ps" ? category.namePs : category.nameEn}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
