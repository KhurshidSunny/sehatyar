"use client";

import { useEffect } from "react";

/** Registers the installability service worker once on the client. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failures are non-blocking */
    });
  }, []);

  return null;
}
