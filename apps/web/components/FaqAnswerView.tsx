"use client";

import CachedContentBadge from "@/components/CachedContentBadge";
import DangerBadge from "@/components/DangerBadge";
import FaqAudioButton from "@/components/FaqAudioButton";
import FaqHelpfulness from "@/components/FaqHelpfulness";
import ScreenHeader from "@/components/ScreenHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Faq, FaqCategory } from "@/lib/types";

export default function FaqAnswerView({
  faq,
  category,
  fromCache = false,
}: {
  faq: Faq;
  category: FaqCategory | undefined;
  fromCache?: boolean;
}) {
  const { locale, t } = useLocale();
  const categoryName =
    category == null ? null : locale === "ps" ? category.namePs : category.nameEn;
  const question = locale === "ps" ? faq.questionPs : faq.questionEn;
  const answer = locale === "ps" ? faq.answerPs : faq.answerEn;

  return (
    <>
      <ScreenHeader title={t("answer")} backHref={`/faqs/${faq.category}`} />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6">
        <CachedContentBadge visible={fromCache} />

        {categoryName ? (
          <p className="text-center text-base text-muted sm:text-lg">{categoryName}</p>
        ) : null}

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface px-5 py-5 shadow-sm">
          <h2 className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
            {question}
          </h2>
          <DangerBadge level={faq.dangerLevel} />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface px-5 py-5 shadow-sm">
          <p className="text-base font-medium text-muted">{t("answer")}</p>
          <p className="text-lg leading-relaxed text-foreground sm:text-xl">{answer}</p>
        </div>

        <FaqAudioButton audioUrl={faq.audioUrl} />
        <FaqHelpfulness faqId={faq.id} />
      </main>
    </>
  );
}
