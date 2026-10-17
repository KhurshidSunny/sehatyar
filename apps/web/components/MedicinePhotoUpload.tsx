"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  MEDICINE_PHOTO_ACCEPT,
  validateMedicinePhoto,
  type MedicinePhotoError,
} from "@/lib/medicines/photo";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Phase = "pick" | "preview" | "submitted";

export default function MedicinePhotoUpload() {
  const { t } = useLocale();
  const cameraInputId = useId();
  const fileInputId = useId();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<MedicinePhotoError | null>(null);

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
    setError(null);
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
      setError(problem);
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setError(null);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    setPhase("preview");
  }

  function handleSubmit() {
    if (!file) {
      return;
    }
    setPhase("submitted");
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

      {previewUrl && (phase === "preview" || phase === "submitted") ? (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img
              src={previewUrl}
              alt={t("photoPreviewAlt")}
              className="mx-auto max-h-80 w-full object-contain"
            />
          </div>

          {phase === "preview" ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
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
            </>
          ) : (
            <>
              <p
                className="rounded-2xl border-2 border-border bg-surface px-5 py-5 text-center text-lg font-semibold text-foreground sm:text-xl"
                role="status"
              >
                {t("photoReady")}
              </p>
              <button
                type="button"
                onClick={clearSelection}
                className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-3 text-center text-lg font-semibold text-brand transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {t("changePhoto")}
              </button>
            </>
          )}
        </div>
      ) : null}

      {error ? (
        <p className="text-center text-base text-muted sm:text-lg" role="alert">
          {error === "size" ? t("photoTooLarge") : t("photoInvalidType")}
        </p>
      ) : null}
    </div>
  );
}
