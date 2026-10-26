"use client";

import { useEffect, useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import { MedicineFormIcon } from "@/components/CategoryIcons";
import { ApiError } from "@/lib/api/client";
import { fetchMedicineForms } from "@/lib/api/medicines";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MedicineForm } from "@/lib/types";

/** Special id meaning search the whole catalog. */
export const ANY_MEDICINE_FORM = "any";

export default function MedicineFormPicker({
  onSelect,
}: {
  onSelect: (formId: string) => void;
}) {
  const { locale, t } = useLocale();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [forms, setForms] = useState<MedicineForm[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchMedicineForms();
        if (cancelled) return;
        setForms(data);
        setStatus("ready");
      } catch (error) {
        if (!(error instanceof ApiError)) {
          console.error(error);
        }
        if (cancelled) return;
        setForms([]);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-lg text-muted sm:text-xl">{t("chooseMedicineForm")}</p>

      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? (
        <ErrorState onRetry={() => {
          setStatus("loading");
          setReloadKey((k) => k + 1);
        }}
        />
      ) : null}
      {status === "ready" && forms.length === 0 ? (
        <EmptyState message={t("emptyCategories")} />
      ) : null}

      {status === "ready" && forms.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <li className="col-span-2 sm:col-span-3">
            <button
              type="button"
              onClick={() => onSelect(ANY_MEDICINE_FORM)}
              className="flex min-h-20 w-full items-center gap-4 rounded-2xl border-2 border-brand bg-brand/5 px-4 py-4 text-start shadow-sm transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <MedicineFormIcon formId="any" className="h-12 w-12 shrink-0" />
              <span className="text-xl font-semibold text-brand sm:text-2xl">
                {t("anyMedicineForm")}
              </span>
            </button>
          </li>
          {forms.map((form) => (
            <li key={form.id}>
              <button
                type="button"
                onClick={() => onSelect(form.id)}
                className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-3 py-4 text-center shadow-sm transition hover:border-brand hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <MedicineFormIcon formId={form.id} className="h-12 w-12" />
                <span className="text-base font-semibold text-foreground sm:text-lg">
                  {locale === "ps" ? form.namePs : form.nameEn}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
