"use client";

import { useEffect, useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import CachedContentBadge from "@/components/CachedContentBadge";
import Disclaimer from "@/components/Disclaimer";
import FaqCategoryLinks from "@/components/FaqCategoryLinks";
import LocalizedScreenHeader from "@/components/LocalizedScreenHeader";
import { ApiError } from "@/lib/api/client";
import { fetchFaqCategories } from "@/lib/api/faqs";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { FaqCategory } from "@/lib/types";

type Status = "loading" | "ready" | "error";

export default function FaqsCategoriesScreen() {
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>("loading");
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [fromCache, setFromCache] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await fetchFaqCategories();
        if (cancelled) return;
        setCategories(result.data);
        setFromCache(result.fromCache);
        setStatus("ready");
      } catch (error) {
        if (!(error instanceof ApiError)) {
          console.error(error);
        }
        if (cancelled) return;
        setCategories([]);
        setFromCache(false);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleRetry() {
    setStatus("loading");
    setCategories([]);
    setFromCache(false);
    setReloadKey((key) => key + 1);
  }

  return (
    <div className="flex flex-1 flex-col">
      <LocalizedScreenHeader titleKey="healthQuestions" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        {status === "loading" ? <LoadingState /> : null}
        {status === "error" ? <ErrorState onRetry={handleRetry} /> : null}
        {status === "ready" && categories.length === 0 ? (
          <EmptyState message={t("emptyCategories")} />
        ) : null}
        {status === "ready" && categories.length > 0 ? (
          <>
            <CachedContentBadge visible={fromCache} />
            <FaqCategoryLinks categories={categories} />
          </>
        ) : null}
      </main>

      <Disclaimer />
    </div>
  );
}
