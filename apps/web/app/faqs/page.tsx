import Link from "next/link";

import Disclaimer from "@/components/Disclaimer";
import ScreenHeader from "@/components/ScreenHeader";
import { getFaqCategories } from "@/lib/faqContent";

export default async function FaqsPage() {
  const categories = await getFaqCategories();

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="روغتیا پوښتنې" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">
          کټګوري غوره کړئ
        </p>

        <ul className="flex flex-col gap-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/faqs/${category.id}`}
                className="flex min-h-16 w-full flex-col justify-center rounded-2xl border-2 border-border bg-surface px-5 py-4 shadow-sm transition hover:border-brand hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="text-xl font-semibold text-foreground sm:text-2xl">
                  {category.namePs}
                </span>
                <span
                  className="notranslate text-base text-muted"
                  translate="no"
                  lang="en"
                >
                  {category.nameEn}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Disclaimer />
    </div>
  );
}
