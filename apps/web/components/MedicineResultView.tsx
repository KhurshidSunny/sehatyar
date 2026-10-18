"use client";

import FaqAudioButton from "@/components/FaqAudioButton";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MedicineOcrCandidate } from "@/lib/types";

export default function MedicineResultView({
  medicine,
  onBack,
}: {
  medicine: MedicineOcrCandidate;
  onBack: () => void;
}) {
  const { locale, t } = useLocale();
  const uses = locale === "ps" ? medicine.usesPs : medicine.usesEn;
  const warnings = locale === "ps" ? medicine.warningsPs : medicine.warningsEn;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-lg font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {t("back")}
      </button>

      <div className="rounded-2xl border-2 border-border bg-surface px-5 py-5 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {medicine.names[0]}
        </h2>
        {medicine.names.length > 1 ? (
          <p className="mt-2 text-base text-muted sm:text-lg">
            {medicine.names.slice(1).join(" · ")}
          </p>
        ) : null}
        <p className="mt-3 text-base text-muted">
          {t("ocrConfidence")}:{" "}
          {medicine.confidence === "high"
            ? t("confidenceHigh")
            : medicine.confidence === "medium"
              ? t("confidenceMedium")
              : t("confidenceLow")}
        </p>
      </div>

      <div className="rounded-2xl border-2 border-border bg-surface px-5 py-5 shadow-sm">
        <p className="text-base font-medium text-muted">{t("medicineUses")}</p>
        <p className="mt-2 text-lg leading-relaxed text-foreground sm:text-xl">{uses}</p>
      </div>

      <div className="rounded-2xl border-2 border-border bg-surface px-5 py-5 shadow-sm">
        <p className="text-base font-medium text-muted">{t("medicineWarnings")}</p>
        <p className="mt-2 text-lg leading-relaxed text-foreground sm:text-xl">
          {warnings}
        </p>
      </div>

      <FaqAudioButton audioUrl={medicine.audioUrl} />
    </div>
  );
}
