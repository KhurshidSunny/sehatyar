"use client";

import { useEffect } from "react";

import { warmOfflineAudioCache } from "@/lib/offline/topFaqs";

/** Registers the service worker and warms offline audio when present. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => warmOfflineAudioCache())
      .catch(() => {
        /* registration failures are non-blocking */
      });
  }, []);

  return null;
}
