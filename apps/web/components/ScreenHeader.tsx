"use client";

import BackLink from "@/components/BackLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ScreenHeaderProps {
  title: string;
  backHref?: string;
  /** When omitted, uses the localized Home / Back label. */
  backLabel?: string;
}

export default function ScreenHeader({
  title,
  backHref = "/",
  backLabel,
}: ScreenHeaderProps) {
  const { t } = useLocale();
  const label = backLabel ?? (backHref === "/" ? t("home") : t("back"));

  return (
    <header className="border-b border-border bg-surface px-4 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
        <BackLink href={backHref} label={label} />
        <h1 className="text-center text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h1>
        <span className="w-16 shrink-0" aria-hidden="true" />
      </div>
    </header>
  );
}
