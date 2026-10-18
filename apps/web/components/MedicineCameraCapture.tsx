"use client";

import { useEffect, useRef, useState } from "react";

import { useLocale } from "@/lib/i18n/LocaleProvider";

type Props = {
  onCapture: (file: File) => void;
  onCancel: () => void;
  onUnavailable: () => void;
};

/** Live camera preview using getUserMedia (desktop + mobile). */
export default function MedicineCameraCapture({
  onCapture,
  onCancel,
  onUnavailable,
}: Props) {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        onUnavailable();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          onUnavailable();
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [onUnavailable]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !ready || video.videoWidth === 0) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }
        stopStream();
        const file = new File([blob], `medicine-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }

  function handleCancel() {
    stopStream();
    onCancel();
  }

  if (error) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border-2 border-border bg-black shadow-sm">
        <video
          ref={videoRef}
          className="mx-auto max-h-80 w-full object-contain"
          playsInline
          muted
          autoPlay
        />
      </div>
      <button
        type="button"
        disabled={!ready}
        onClick={handleCapture}
        className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-brand px-6 py-4 text-center text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 sm:text-2xl"
      >
        {t("capturePhoto")}
      </button>
      <button
        type="button"
        onClick={handleCancel}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-border bg-surface px-6 py-3 text-center text-lg font-semibold text-muted transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {t("cancelCamera")}
      </button>
    </div>
  );
}
