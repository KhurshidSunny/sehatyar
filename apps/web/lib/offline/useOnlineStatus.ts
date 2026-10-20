"use client";

import { useEffect, useState } from "react";

/** Tracks browser online/offline; updates on `online` / `offline` events. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    function sync() {
      setOnline(navigator.onLine);
    }

    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}
