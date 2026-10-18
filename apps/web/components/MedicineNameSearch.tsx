"use client";

import { useId, useState } from "react";

import { LoadingState } from "@/components/AsyncState";
import { ApiError } from "@/lib/api/client";
import { searchMedicines } from "@/lib/api/medicines";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MedicineSummary } from "@/lib/types";

const MIN_QUERY_LEN = 2;

export default function MedicineNameSearch({
  onSelect,
  onCancel,
  showCancel = false,
}: {
  onSelect: (medicine: MedicineSummary) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}) {
  const { t } = useLocale();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MedicineSummary[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function runSearch() {
    const q = query.trim();
    if (q.length < MIN_QUERY_LEN) {
      setSearched(false);
      setResults([]);
      setFailed(false);
      return;
    }
    setLoading(true);
    setFailed(false);
    try {
      const hits = await searchMedicines(q);
      setResults(hits);
      setSearched(true);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error(error);
      }
      setResults([]);
      setSearched(false);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={inputId} className="text-center text-lg font-semibold text-foreground">
        {t("typeMedicineName")}
      </label>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch();
        }}
      >
        <input
          id={inputId}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearched(false);
            setFailed(false);
          }}
          placeholder={t("medicineSearchPlaceholder")}
          className="min-h-14 w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-center text-lg text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < MIN_QUERY_LEN}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-brand px-6 py-3 text-center text-lg font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("searchMedicine")}
        </button>
      </form>

      {loading ? <LoadingState /> : null}

      {failed ? (
        <p className="rounded-2xl border-2 border-border bg-surface px-5 py-4 text-center text-lg text-muted" role="alert">
          {t("loadError")}
        </p>
      ) : null}

      {!loading && searched && results.length === 0 ? (
        <p className="rounded-2xl border-2 border-border bg-surface px-5 py-4 text-center text-lg text-muted" role="status">
          {t("medicineSearchEmpty")}
        </p>
      ) : null}

      {!loading && results.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full flex-col rounded-2xl border-2 border-border bg-surface px-5 py-4 text-start shadow-sm transition hover:border-brand hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="text-lg font-semibold text-foreground sm:text-xl">
                  {item.names[0]}
                </span>
                {item.names.length > 1 ? (
                  <span className="mt-1 text-base text-muted">
                    {item.names.slice(1, 3).join(" · ")}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showCancel && onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-border bg-surface px-6 py-3 text-center text-lg font-semibold text-muted transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {t("back")}
        </button>
      ) : null}
    </div>
  );
}
