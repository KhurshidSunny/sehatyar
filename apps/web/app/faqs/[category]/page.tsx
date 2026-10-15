import { notFound } from "next/navigation";

import DangerBadge from "@/components/DangerBadge";
import Disclaimer from "@/components/Disclaimer";
import ScreenHeader from "@/components/ScreenHeader";
import { getFaqCategories, getFaqCategory, getFaqSummaries } from "@/lib/faqContent";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getFaqCategories();
  return categories.map((category) => ({ category: category.id }));
}

export default async function FaqCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryId } = await params;
  const category = await getFaqCategory(categoryId);
  if (!category) {
    notFound();
  }

  const questions = await getFaqSummaries(category.id);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title={category.namePs} backHref="/faqs" backLabel="شاته" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">
          پوښتنه غوره کړئ
        </p>

        {questions.length === 0 ? (
          <p className="rounded-2xl border-2 border-border bg-surface px-5 py-6 text-center text-lg text-muted">
            په دې برخه کې لا پوښتنې نشته.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {questions.map((question) => (
              <li
                key={question.id}
                className="flex min-h-16 flex-col justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-5 py-4 shadow-sm"
              >
                <span className="text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
                  {question.questionPs}
                </span>
                <DangerBadge level={question.dangerLevel} />
              </li>
            ))}
          </ol>
        )}
      </main>

      <Disclaimer />
    </div>
  );
}
