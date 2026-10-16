import FaqDetailScreen from "@/components/FaqDetailScreen";

export default async function FaqAnswerPage({
  params,
}: {
  params: Promise<{ category: string; faqId: string }>;
}) {
  const { category, faqId } = await params;
  return <FaqDetailScreen categoryId={category} faqId={faqId} />;
}
