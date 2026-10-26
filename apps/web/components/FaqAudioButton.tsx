"use client";

import { useEffect, useRef, useState } from "react";

import { useLocale } from "@/lib/i18n/LocaleProvider";

interface FaqAudioButtonProps {
  audioUrl: string | null;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const whole = Math.floor(seconds);
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * FAQ / medicine answer audio: icon play/pause + scrubbable progress bar.
 * Pashto recordings play only when locale is Pashto; English shows coming soon.
 * When audioUrl is null, shows a clear "no audio yet" state.
 */
export default function FaqAudioButton({ audioUrl }: FaqAudioButtonProps) {
  const { locale, t } = useLocale();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Current recordings are Pashto-only; hide the player in English.
  const playableUrl = locale === "ps" ? audioUrl : null;
  const englishComingSoon = locale === "en";

  useEffect(() => {
    setPlaying(false);
    setFailed(false);
    setCurrentTime(0);
    setDuration(0);

    if (!playableUrl) {
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }

    const audio = new Audio(playableUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, [playableUrl]);

  if (englishComingSoon) {
    return (
      <div
        className="flex min-h-16 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface px-5 py-4 text-center"
        role="status"
      >
        <span className="text-lg font-semibold text-muted sm:text-xl">
          {t("audioComingSoon")}
        </span>
      </div>
    );
  }

  if (!playableUrl || failed) {
    return (
      <div
        className="flex min-h-16 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface px-5 py-4 text-center"
        role="status"
      >
        <span className="text-lg font-semibold text-muted sm:text-xl">
          {t("audioUnavailable")}
        </span>
      </div>
    );
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setFailed(true);
      setPlaying(false);
    }
  }

  function seek(next: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(next)) {
      return;
    }
    const capped = Math.min(Math.max(next, 0), duration || next);
    audio.currentTime = capped;
    setCurrentTime(capped);
  }

  const progressMax = duration > 0 ? duration : 1;
  const progressValue = duration > 0 ? currentTime : 0;

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border-2 border-border bg-surface px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:h-16 sm:w-16"
          aria-label={playing ? t("pauseAudio") : t("playAudio")}
          aria-pressed={playing}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-base font-semibold text-foreground sm:text-lg">
            {playing ? t("pauseAudio") : t("playAudio")}
          </p>
          <label className="sr-only" htmlFor="faq-audio-progress">
            {t("audioProgress")}
          </label>
          <input
            id="faq-audio-progress"
            type="range"
            min={0}
            max={progressMax}
            step={0.1}
            value={progressValue}
            onChange={(event) => seek(Number(event.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-border accent-brand [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
            aria-valuemin={0}
            aria-valuemax={Math.round(progressMax)}
            aria-valuenow={Math.round(progressValue)}
          />
          <div className="flex justify-between text-sm font-medium text-muted sm:text-base">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 translate-x-0.5 sm:h-8 sm:w-8"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 sm:h-8 sm:w-8"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 5h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm7 0h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </svg>
  );
}
