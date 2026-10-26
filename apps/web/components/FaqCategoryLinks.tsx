"use client";

import Link from "next/link";

import { FaqCategoryIcon } from "@/components/CategoryIcons";
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
              className="flex min-h-20 w-full items-center gap-4 rounded-2xl border-2 border-border bg-surface px-4 py-4 shadow-sm transition hover:border-brand hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <FaqCategoryIcon categoryId={category.id} className="h-12 w-12 shrink-0" />
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
