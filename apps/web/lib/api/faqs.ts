import { apiGet } from "@/lib/api/client";
import type { Faq, FaqCategory, FaqSummary } from "@/lib/types";

export function fetchFaqCategories(): Promise<FaqCategory[]> {
  return apiGet<FaqCategory[]>("/categories");
}

export function fetchFaqSummaries(categoryId?: string): Promise<FaqSummary[]> {
  const query =
    categoryId == null || categoryId === ""
      ? ""
      : `?category=${encodeURIComponent(categoryId)}`;
  return apiGet<FaqSummary[]>(`/faqs${query}`);
}

export function fetchFaq(faqId: string): Promise<Faq> {
  return apiGet<Faq>(`/faqs/${encodeURIComponent(faqId)}`);
}
