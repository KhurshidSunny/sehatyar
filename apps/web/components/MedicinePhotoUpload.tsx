"use client";

import { useEffect, useId, useRef, useState } from "react";

import { LoadingState } from "@/components/AsyncState";
import { ApiError } from "@/lib/api/client";
import { postMedicineOcr } from "@/lib/api/medicines";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  MEDICINE_PHOTO_ACCEPT,
  validateMedicinePhoto,
  type MedicinePhotoError,
} from "@/lib/medicines/photo";
import type { MedicineOcrCandidate } from "@/lib/types";

type Phase = "pick" | "preview" | "loading" | "results" | "error";

export default function MedicinePhotoUpload() {
  const { locale, t } = useLocale();
  const cameraInputId = useId();
  const fileInputId = useId();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<MedicinePhotoError | null>(null);
  const [candidates, setCandidates] = useState<MedicineOcrCandidate[]>([]);
  const [ocrEmpty, setOcrEmpty] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearSelection() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFile(null);
    setPhotoError(null);
    setCandidates([]);
    setOcrEmpty(false);
    setPhase("pick");
    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  }

  function applyFile(next: File | undefined) {
    if (!next) {
      return;
    }
    const problem = validateMedicinePhoto(next);
    if (problem) {
      setPhotoError(problem);
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPhotoError(null);
    setCandidates([]);
    setOcrEmpty(false);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    setPhase("preview");
  }

  async function handleSubmit() {
    if (!file) {
      return;
    }
    setPhase("loading");
    setPhotoError(null);
    try {
      const result = await postMedicineOcr(file);
      setCandidates(result.candidates);
      setOcrEmpty(result.candidates.length === 0);
      setPhase("results");
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error(error);
      }
      setPhase("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg text-muted sm:text-xl">{t("medicineHint")}</p>

      <input
        id={cameraInputId}
        ref={cameraRef}
        type="file"
        accept={MEDICINE_PHOTO_ACCEPT}
        capture="environment"
        className="sr-only"
        onChange={(event) => applyFile(event.target.files?.[0])}
      />
      <input
        id={fileInputId}
        ref={fileRef}
        type="file"
        accept={MEDICINE_PHOTO_ACCEPT}
        className="sr-only"
        onChange={(event) => applyFile(event.target.files?.[0])}
      />

      {phase === "pick" ? (
        <div className="flex flex-col gap-3">
          <label
            htmlFor={cameraInputId}
            className="flex min-h-20 w-full cursor-pointer items-center justify-center rounded-2xl bg-brand px-6 py-5 text-center text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand sm:text-2xl"
          >
            {t("takePhoto")}
          </label>
          <label
            htmlFor={fileInputId}
            className="flex min-h-20 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-5 text-center text-xl font-semibold text-brand shadow-sm transition hover:bg-brand/5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand sm:text-2xl"
          >
            {t("choosePhoto")}
          </label>
        </div>
      ) : null}

      {previewUrl && phase !== "pick" ? (
        <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img
            src={previewUrl}
            alt={t("photoPreviewAlt")}
            className="mx-auto max-h-72 w-full object-contain"
          />
        </div>
      ) : null}

      {phase === "preview" ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-brand px-6 py-4 text-center text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
          >
            {t("submitPhoto")}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-border bg-surface px-6 py-3 text-center text-lg font-semibold text-muted transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {t("changePhoto")}
          </button>
        </div>
      ) : null}

      {phase === "loading" ? <LoadingState /> : null}

      {phase === "error" ? (
        <div className="flex flex-col gap-3" role="alert">
          <p className="rounded-2xl border-2 border-border bg-surface px-5 py-5 text-center text-lg text-muted">
            {t("ocrFailed")}
          </p>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-brand px-6 py-3 text-center text-lg font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {t("retry")}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-border bg-surface px-6 py-3 text-center text-lg font-semibold text-muted transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {t("changePhoto")}
          </button>
        </div>
      ) : null}

      {phase === "results" ? (
        <div className="flex flex-col gap-3">
          {ocrEmpty ? (
            <p
              className="rounded-2xl border-2 border-border bg-surface px-5 py-5 text-center text-lg text-muted"
              role="status"
            >
              {t("ocrNoMatch")}
            </p>
          ) : (
            <>
              <p className="text-center text-lg font-semibold text-foreground sm:text-xl">
                {t("ocrMatches")}
              </p>
              <ul className="flex flex-col gap-3">
                {candidates.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl border-2 border-border bg-surface px-5 py-4 shadow-sm"
                  >
                    <p className="text-lg font-semibold text-foreground sm:text-xl">
                      {item.names[0]}
                    </p>
                    {item.names.length > 1 ? (
                      <p className="mt-1 text-base text-muted">
                        {item.names.slice(1, 3).join(" · ")}
                      </p>
                    ) : null}
                    <p className="mt-2 text-base text-muted">
                      {t("ocrConfidence")}:{" "}
                      {item.confidence === "high"
                        ? t("confidenceHigh")
                        : item.confidence === "medium"
                          ? t("confidenceMedium")
                          : t("confidenceLow")}
                      {locale === "en" ? ` (${Math.round(item.score)})` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button
            type="button"
            onClick={clearSelection}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-3 text-center text-lg font-semibold text-brand transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {t("changePhoto")}
          </button>
        </div>
      ) : null}

      {photoError ? (
        <p className="text-center text-base text-muted sm:text-lg" role="alert">
          {photoError === "size" ? t("photoTooLarge") : t("photoInvalidType")}
        </p>
      ) : null}
    </div>
  );
}
