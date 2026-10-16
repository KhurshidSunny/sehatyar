"use client";

import ScreenHeader from "@/components/ScreenHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { FaqCategory } from "@/lib/types";

export default function LocalizedCategoryHeader({ category }: { category: FaqCategory }) {
  const { locale } = useLocale();
  const title = locale === "ps" ? category.namePs : category.nameEn;
  return <ScreenHeader title={title} backHref="/faqs" />;
}
