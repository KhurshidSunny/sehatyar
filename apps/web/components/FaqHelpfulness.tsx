"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { postFeedback } from "@/lib/api/feedback";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Status = "idle" | "sending" | "done" | "error";

export default function FaqHelpfulness({ faqId }: { faqId: string }) {
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>("idle");

  async function sendVote(helpful: boolean) {
    if (status === "sending" || status === "done") {
      return;
    }
    setStatus("sending");
    try {
      await postFeedback({
        targetType: "faq",
        targetId: faqId,
        helpful,
      });
      setStatus("done");
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error(error);
      }
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        className="rounded-2xl border-2 border-border bg-surface px-5 py-5 text-center"
        role="status"
      >
        <p className="text-lg font-semibold text-foreground sm:text-xl">
          {t("feedbackThanks")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface px-5 py-5">
      <p className="text-center text-lg font-semibold text-foreground sm:text-xl">
        {t("wasThisHelpful")}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={status === "sending"}
          onClick={() => void sendVote(true)}
          className="min-h-14 rounded-xl bg-brand px-4 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 sm:text-xl"
        >
          {t("feedbackYes")}
        </button>
        <button
          type="button"
          disabled={status === "sending"}
          onClick={() => void sendVote(false)}
          className="min-h-14 rounded-xl border-2 border-brand bg-surface px-4 py-3 text-lg font-semibold text-brand shadow-sm transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 sm:text-xl"
        >
          {t("feedbackNo")}
        </button>
      </div>

      {status === "error" ? (
        <div className="flex flex-col items-center gap-2" role="alert">
          <p className="text-center text-base text-muted">{t("feedbackError")}</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="min-h-11 rounded-xl px-4 py-2 text-base font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {t("retry")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
