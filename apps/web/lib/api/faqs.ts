import { ApiError, apiGet } from "@/lib/api/client";
import {
  loadOfflineFaqPack,
  offlineCategories,
  offlineFaqById,
  offlineFaqSummaries,
} from "@/lib/offline/topFaqs";
import type { Faq, FaqCategory, FaqSummary } from "@/lib/types";

export type FaqLoadResult<T> = {
  data: T;
  fromCache: boolean;
};

async function fromOfflineCategories(): Promise<FaqCategory[]> {
  const pack = await loadOfflineFaqPack();
  return offlineCategories(pack);
}

async function fromOfflineSummaries(categoryId?: string): Promise<FaqSummary[]> {
  const pack = await loadOfflineFaqPack();
  if (categoryId) {
    const known = pack.categories.some((item) => item.id === categoryId);
    if (!known) {
      throw new ApiError(404, "Category not found");
    }
  }
  return offlineFaqSummaries(pack, categoryId);
}

async function fromOfflineFaq(faqId: string): Promise<Faq> {
  const pack = await loadOfflineFaqPack();
  const faq = offlineFaqById(pack, faqId);
  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }
  return faq;
}

export async function fetchFaqCategories(): Promise<FaqLoadResult<FaqCategory[]>> {
  try {
    const data = await apiGet<FaqCategory[]>("/categories");
    return { data, fromCache: false };
  } catch (error) {
    try {
      const data = await fromOfflineCategories();
      return { data, fromCache: true };
    } catch {
      throw error;
    }
  }
}

export async function fetchFaqSummaries(
  categoryId?: string,
): Promise<FaqLoadResult<FaqSummary[]>> {
  try {
    const query =
      categoryId == null || categoryId === ""
        ? ""
        : `?category=${encodeURIComponent(categoryId)}`;
    const data = await apiGet<FaqSummary[]>(`/faqs${query}`);
    return { data, fromCache: false };
  } catch (error) {
    try {
      const data = await fromOfflineSummaries(categoryId);
      return { data, fromCache: true };
    } catch (offlineError) {
      if (offlineError instanceof ApiError) {
        throw offlineError;
      }
      throw error;
    }
  }
}

export async function fetchFaq(faqId: string): Promise<FaqLoadResult<Faq>> {
  try {
    const data = await apiGet<Faq>(`/faqs/${encodeURIComponent(faqId)}`);
    return { data, fromCache: false };
  } catch (error) {
    try {
      const data = await fromOfflineFaq(faqId);
      return { data, fromCache: true };
    } catch {
      throw error;
    }
  }
}
