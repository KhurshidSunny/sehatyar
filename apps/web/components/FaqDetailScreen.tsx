"use client";

import { useEffect, useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import Disclaimer from "@/components/Disclaimer";
import FaqAnswerView from "@/components/FaqAnswerView";
import LocalizedScreenHeader from "@/components/LocalizedScreenHeader";
import { ApiError } from "@/lib/api/client";
import { fetchFaq, fetchFaqCategories } from "@/lib/api/faqs";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Faq, FaqCategory } from "@/lib/types";

type Status = "loading" | "ready" | "error" | "missing";

export default function FaqDetailScreen({
  categoryId,
  faqId,
}: {
  categoryId: string;
  faqId: string;
}) {
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>("loading");
  const [faq, setFaq] = useState<Faq | null>(null);
  const [category, setCategory] = useState<FaqCategory | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [detail, categories] = await Promise.all([
          fetchFaq(faqId),
          fetchFaqCategories(),
        ]);
        if (cancelled) return;

        if (detail.category !== categoryId) {
          setFaq(null);
          setCategory(undefined);
          setStatus("missing");
          return;
        }

        setFaq(detail);
        setCategory(categories.find((item) => item.id === categoryId));
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 404) {
          setFaq(null);
          setCategory(undefined);
          setStatus("missing");
          return;
        }

        if (!(error instanceof ApiError)) {
          console.error(error);
        }
        setFaq(null);
        setCategory(undefined);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryId, faqId, reloadKey]);

  function handleRetry() {
    setStatus("loading");
    setFaq(null);
    setCategory(undefined);
    setReloadKey((key) => key + 1);
  }

  return (
    <div className="flex flex-1 flex-col">
      {status === "ready" && faq ? (
        <FaqAnswerView faq={faq} category={category} />
      ) : (
        <>
          <LocalizedScreenHeader titleKey="answer" backHref={`/faqs/${categoryId}`} />
          <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
            {status === "loading" ? <LoadingState /> : null}
            {status === "error" ? <ErrorState onRetry={handleRetry} /> : null}
            {status === "missing" ? <EmptyState message={t("notFound")} /> : null}
          </main>
        </>
      )}
      <Disclaimer />
    </div>
  );
}
