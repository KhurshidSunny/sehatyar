"use client";

import { useEffect, useRef, useState } from "react";

interface FaqAudioButtonProps {
  audioUrl: string | null;
}

/**
 * Large Play control for FAQ answers.
 * When audioUrl is null, shows a clear "no audio yet" state instead of a broken player.
 */
export default function FaqAudioButton({ audioUrl }: FaqAudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  if (!audioUrl || failed) {
    return (
      <div
        className="flex min-h-16 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface px-5 py-4 text-center"
        role="status"
      >
        <span className="text-lg font-semibold text-muted sm:text-xl">غږ لا نشته</span>
        <span className="mt-1 text-base text-muted">Audio not available yet</span>
      </div>
    );
  }

  async function togglePlay() {
    if (!audioUrl) {
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("error", () => {
        setFailed(true);
        setPlaying(false);
      });
    }

    const audio = audioRef.current;
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

  return (
    <button
      type="button"
      onClick={togglePlay}
      className="flex min-h-16 w-full flex-col items-center justify-center rounded-2xl bg-brand px-5 py-4 text-center text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
      aria-pressed={playing}
    >
      {playing ? "ودروئ" : "غږ واورئ"}
      <span className="mt-1 block text-base font-normal text-teal-50">
        {playing ? "Stop" : "Play audio"}
      </span>
    </button>
  );
}
