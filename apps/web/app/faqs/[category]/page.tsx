import Disclaimer from "@/components/Disclaimer";
import FaqQuestionLinks from "@/components/FaqQuestionLinks";
import LocalizedCategoryHeader from "@/components/LocalizedCategoryHeader";
import { getFaqCategories, getFaqCategory, getFaqSummaries } from "@/lib/faqContent";
import { notFound } from "next/navigation";

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
      <LocalizedCategoryHeader category={category} />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <FaqQuestionLinks categoryId={category.id} questions={questions} />
      </main>

      <Disclaimer />
    </div>
  );
}
