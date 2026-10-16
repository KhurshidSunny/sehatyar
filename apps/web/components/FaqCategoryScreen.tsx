"use client";

import { useEffect, useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import Disclaimer from "@/components/Disclaimer";
import FaqQuestionLinks from "@/components/FaqQuestionLinks";
import LocalizedCategoryHeader from "@/components/LocalizedCategoryHeader";
import LocalizedScreenHeader from "@/components/LocalizedScreenHeader";
import { ApiError } from "@/lib/api/client";
import { fetchFaqCategories, fetchFaqSummaries } from "@/lib/api/faqs";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { FaqCategory, FaqSummary } from "@/lib/types";

type Status = "loading" | "ready" | "error" | "missing";

export default function FaqCategoryScreen({ categoryId }: { categoryId: string }) {
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>("loading");
  const [category, setCategory] = useState<FaqCategory | null>(null);
  const [questions, setQuestions] = useState<FaqSummary[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [categories, faqs] = await Promise.all([
          fetchFaqCategories(),
          fetchFaqSummaries(categoryId),
        ]);
        if (cancelled) return;

        const match = categories.find((item) => item.id === categoryId) ?? null;
        if (!match) {
          setCategory(null);
          setQuestions([]);
          setStatus("missing");
          return;
        }

        setCategory(match);
        setQuestions(faqs);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 404) {
          setCategory(null);
          setQuestions([]);
          setStatus("missing");
          return;
        }

        if (!(error instanceof ApiError)) {
          console.error(error);
        }
        setCategory(null);
        setQuestions([]);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryId, reloadKey]);

  function handleRetry() {
    setStatus("loading");
    setCategory(null);
    setQuestions([]);
    setReloadKey((key) => key + 1);
  }

  return (
    <div className="flex flex-1 flex-col">
      {category ? (
        <LocalizedCategoryHeader category={category} />
      ) : (
        <LocalizedScreenHeader titleKey="healthQuestions" backHref="/faqs" />
      )}

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        {status === "loading" ? <LoadingState /> : null}
        {status === "error" ? <ErrorState onRetry={handleRetry} /> : null}
        {status === "missing" ? <EmptyState message={t("notFound")} /> : null}
        {status === "ready" && category ? (
          questions.length === 0 ? (
            <EmptyState message={t("noQuestionsYet")} />
          ) : (
            <FaqQuestionLinks categoryId={category.id} questions={questions} />
          )
        ) : null}
      </main>

      <Disclaimer />
    </div>
  );
}
