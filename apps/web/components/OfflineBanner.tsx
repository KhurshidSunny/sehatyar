"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

/** Full-width notice when the device has no network. */
export default function OfflineBanner() {
  const { t } = useLocale();
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div
      className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-base font-semibold text-amber-950 sm:px-6 sm:text-lg"
      role="status"
      aria-live="polite"
    >
      {t("offlineBanner")}
    </div>
  );
}
