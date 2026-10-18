"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { LoadingState } from "@/components/AsyncState";
import MedicineCameraCapture from "@/components/MedicineCameraCapture";
import MedicineNameSearch from "@/components/MedicineNameSearch";
import MedicineResultView from "@/components/MedicineResultView";
import { ApiError } from "@/lib/api/client";
import { postMedicineOcr } from "@/lib/api/medicines";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  MEDICINE_PHOTO_ACCEPT,
  validateMedicinePhoto,
  type MedicinePhotoError,
} from "@/lib/medicines/photo";
import type { MedicineOcrCandidate, MedicineSummary } from "@/lib/types";

type Phase =
  | "pick"
  | "camera"
  | "preview"
  | "loading"
  | "results"
  | "type"
  | "detail"
  | "error";

function visibleCandidates(items: MedicineOcrCandidate[]): MedicineOcrCandidate[] {
  const high = items.filter((item) => item.confidence === "high");
  if (high.length > 0) {
    return high;
  }
  return items.slice(0, 3);
}

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
  const [selected, setSelected] = useState<
    MedicineOcrCandidate | MedicineSummary | null
  >(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrEmpty, setOcrEmpty] = useState(false);
  /** Where Back from typed-search detail should return. */
  const [detailReturn, setDetailReturn] = useState<Phase>("results");

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
    setSelected(null);
    setOcrText("");
    setOcrEmpty(false);
    setDetailReturn("results");
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
    setSelected(null);
    setOcrText("");
    setOcrEmpty(false);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    setPhase("preview");
  }

  const openCameraFallback = useCallback(() => {
    setPhase("pick");
    queueMicrotask(() => cameraRef.current?.click());
  }, []);

  async function handleSubmit() {
    if (!file) {
      return;
    }
    setPhase("loading");
    setPhotoError(null);
    try {
      const result = await postMedicineOcr(file);
      const ranked = visibleCandidates(result.candidates);
      setCandidates(ranked);
      setSelected(null);
      setOcrText(result.ocrText.trim());
      setOcrEmpty(ranked.length === 0);
      setPhase("results");
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error(error);
      }
      setPhase("error");
    }
  }

  function openTypedSearch(from: Phase) {
    setDetailReturn(from);
    setSelected(null);
    setPhase("type");
  }

  function selectTypedMedicine(medicine: MedicineSummary) {
    setSelected(medicine);
    setPhase("detail");
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg text-muted sm:text-xl">{t("medicineHint")}</p>

      <input
        id={cameraInputId}
        ref={cameraRef}
        type="file"
        accept="image/*"
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
          <button
            type="button"
            onClick={() => setPhase("camera")}
            className="flex min-h-20 w-full items-center justify-center rounded-2xl bg-brand px-6 py-5 text-center text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
          >
            {t("takePhoto")}
          </button>
          <label
            htmlFor={fileInputId}
            className="flex min-h-20 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-5 text-center text-xl font-semibold text-brand shadow-sm transition hover:bg-brand/5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand sm:text-2xl"
          >
            {t("choosePhoto")}
          </label>
          <button
            type="button"
            onClick={() => openTypedSearch("pick")}
            className="flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-border bg-surface px-6 py-4 text-center text-xl font-semibold text-foreground shadow-sm transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
          >
            {t("typeMedicineName")}
          </button>
        </div>
      ) : null}

      {phase === "camera" ? (
        <MedicineCameraCapture
          onCapture={(captured) => applyFile(captured)}
          onCancel={() => setPhase("pick")}
          onUnavailable={openCameraFallback}
        />
      ) : null}

      {previewUrl &&
      phase !== "pick" &&
      phase !== "camera" &&
      phase !== "detail" &&
      phase !== "type" ? (
        <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img
            src={previewUrl}
            alt={t("photoPreviewAlt")}
            className="mx-auto max-h-72 w-full object-contain"
          />
        </div>
      ) : null}

      {phase === "detail" && selected ? (
        <MedicineResultView
          medicine={selected}
          onBack={() => {
            setSelected(null);
            setPhase(detailReturn === "type" ? "type" : "results");
          }}
        />
      ) : null}

      {phase === "type" ? (
        <MedicineNameSearch
          showCancel
          onCancel={() => {
            setSelected(null);
            setPhase(detailReturn === "pick" ? "pick" : detailReturn);
          }}
          onSelect={(medicine) => {
            setDetailReturn("type");
            selectTypedMedicine(medicine);
          }}
        />
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
            onClick={() => openTypedSearch("error")}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-3 text-center text-lg font-semibold text-brand transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {t("typeMedicineName")}
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
            <div className="flex flex-col gap-3" role="status">
              <p className="rounded-2xl border-2 border-border bg-surface px-5 py-5 text-center text-lg text-muted">
                {t("ocrNoMatch")}
              </p>
              {ocrText.length >= 8 && /[A-Za-z]{5,}/.test(ocrText) ? (
                <>
                  <p className="text-center text-base font-semibold text-foreground">
                    {t("ocrTextLabel")}
                  </p>
                  <p className="whitespace-pre-wrap rounded-2xl border-2 border-dashed border-border bg-surface px-4 py-3 text-center text-base text-muted">
                    {ocrText}
                  </p>
                </>
              ) : null}
              <MedicineNameSearch
                onSelect={(medicine) => {
                  setDetailReturn("results");
                  selectTypedMedicine(medicine);
                }}
              />
            </div>
          ) : (
            <>
              <p className="text-center text-lg font-semibold text-foreground sm:text-xl">
                {t("ocrMatches")}
              </p>
              <p className="text-center text-base text-muted">{t("ocrTapHint")}</p>
              <ul className="flex flex-col gap-3">
                {candidates.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setDetailReturn("results");
                        setPhase("detail");
                      }}
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
                      <span className="mt-2 text-base text-muted">
                        {t("ocrConfidence")}:{" "}
                        {item.confidence === "high"
                          ? t("confidenceHigh")
                          : item.confidence === "medium"
                            ? t("confidenceMedium")
                            : t("confidenceLow")}
                        {locale === "en" ? ` (${Math.round(item.score)})` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openTypedSearch("results")}
                className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-3 text-center text-lg font-semibold text-brand transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {t("typeMedicineName")}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={clearSelection}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-border bg-surface px-6 py-3 text-center text-lg font-semibold text-muted transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
