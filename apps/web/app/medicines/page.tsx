"use client";

import Disclaimer from "@/components/Disclaimer";
import LocalizedScreenHeader from "@/components/LocalizedScreenHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function MedicinesPage() {
  const { t } = useLocale();

  return (
    <div className="flex flex-1 flex-col">
      <LocalizedScreenHeader titleKey="whatIsThisMedicine" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">{t("medicineHint")}</p>
      </main>

      <Disclaimer />
    </div>
  );
}
