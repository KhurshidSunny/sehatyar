"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { DangerLevel } from "@/lib/types";

const STYLES: Record<Exclude<DangerLevel, "info">, string> = {
  clinic: "border-amber-300 bg-amber-50 text-amber-900",
  emergency: "border-red-300 bg-red-50 text-red-900",
};

export default function DangerBadge({ level }: { level: DangerLevel }) {
  const { t } = useLocale();

  if (level === "info") {
    return null;
  }

  const label = level === "clinic" ? t("clinicBadge") : t("emergencyBadge");

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-semibold ${STYLES[level]}`}
    >
      {label}
    </span>
  );
}
