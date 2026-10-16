import Disclaimer from "@/components/Disclaimer";
import FaqAnswerView from "@/components/FaqAnswerView";
import { getAllFaqs, getFaq, getFaqCategory } from "@/lib/faqContent";
import { notFound } from "next/navigation";

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
      <FaqAnswerView faq={faq} category={category} />
      <Disclaimer />
    </div>
  );
}
