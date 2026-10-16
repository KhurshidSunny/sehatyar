import FaqCategoryScreen from "@/components/FaqCategoryScreen";

export default async function FaqCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <FaqCategoryScreen categoryId={category} />;
}
