"use client";

import ScreenHeader from "@/components/ScreenHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";

/** Screen header whose title comes from the message catalog. */
export default function LocalizedScreenHeader({
  titleKey,
  backHref = "/",
}: {
  titleKey: MessageKey;
  backHref?: string;
}) {
  const { t } = useLocale();
  return <ScreenHeader title={t(titleKey)} backHref={backHref} />;
}
