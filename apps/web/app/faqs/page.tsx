import Disclaimer from "@/components/Disclaimer";
import FaqCategoryLinks from "@/components/FaqCategoryLinks";
import LocalizedScreenHeader from "@/components/LocalizedScreenHeader";
import { getFaqCategories } from "@/lib/faqContent";

export default async function FaqsPage() {
  const categories = await getFaqCategories();

  return (
    <div className="flex flex-1 flex-col">
      <LocalizedScreenHeader titleKey="healthQuestions" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <FaqCategoryLinks categories={categories} />
      </main>

      <Disclaimer />
    </div>
  );
}
