import { notFound } from "next/navigation";

import DangerBadge from "@/components/DangerBadge";
import Disclaimer from "@/components/Disclaimer";
import FaqAudioButton from "@/components/FaqAudioButton";
import ScreenHeader from "@/components/ScreenHeader";
import { getAllFaqs, getFaq, getFaqCategory } from "@/lib/faqContent";

export const dynamicParams = false;

export async function generateStaticParams() {
  const faqs = await getAllFaqs();
  return faqs.map((faq) => ({
    category: faq.category,
    faqId: faq.id,
  }));
}

export default async function FaqAnswerPage({
  params,
}: {
  params: Promise<{ category: string; faqId: string }>;
}) {
  const { category: categoryId, faqId } = await params;
  const faq = await getFaq(faqId);
  if (!faq || faq.category !== categoryId) {
    notFound();
  }

  const category = await getFaqCategory(categoryId);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader
        title="ځواب"
        backHref={`/faqs/${categoryId}`}
        backLabel="شاته"
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6">
        {category ? (
          <p className="text-center text-base text-muted sm:text-lg">{category.namePs}</p>
        ) : null}

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface px-5 py-5 shadow-sm">
          <h2 className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
            {faq.questionPs}
          </h2>
          <DangerBadge level={faq.dangerLevel} />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface px-5 py-5 shadow-sm">
          <p className="text-base font-medium text-muted">ځواب</p>
          <p className="text-lg leading-relaxed text-foreground sm:text-xl">{faq.answerPs}</p>
        </div>

        <FaqAudioButton audioUrl={faq.audioUrl} />
      </main>

      <Disclaimer />
    </div>
  );
}
