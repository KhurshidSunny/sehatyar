"use client";

import Link from "next/link";

import DangerBadge from "@/components/DangerBadge";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { FaqSummary } from "@/lib/types";

export default function FaqQuestionLinks({
  categoryId,
  questions,
}: {
  categoryId: string;
  questions: FaqSummary[];
}) {
  const { locale, t } = useLocale();

  return (
    <>
      <p className="text-center text-lg text-muted sm:text-xl">{t("chooseQuestion")}</p>

      {questions.length === 0 ? (
        <p className="rounded-2xl border-2 border-border bg-surface px-5 py-6 text-center text-lg text-muted">
          {t("noQuestionsYet")}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {questions.map((question) => (
            <li key={question.id}>
              <Link
                href={`/faqs/${categoryId}/${question.id}`}
                className="flex min-h-16 w-full flex-col justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-5 py-4 shadow-sm transition hover:border-brand hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
                  {locale === "ps" ? question.questionPs : question.questionEn}
                </span>
                <DangerBadge level={question.dangerLevel} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
