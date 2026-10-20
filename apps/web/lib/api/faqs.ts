import { ApiError, apiGet } from "@/lib/api/client";
import {
  loadOfflineFaqPack,
  offlineCategories,
  offlineFaqById,
  offlineFaqSummaries,
} from "@/lib/offline/topFaqs";
import type { Faq, FaqCategory, FaqSummary } from "@/lib/types";

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

export async function fetchFaqCategories(): Promise<FaqCategory[]> {
  try {
    return await apiGet<FaqCategory[]>("/categories");
  } catch (error) {
    try {
      return await fromOfflineCategories();
    } catch {
      throw error;
    }
  }
}

export async function fetchFaqSummaries(categoryId?: string): Promise<FaqSummary[]> {
  try {
    const query =
      categoryId == null || categoryId === ""
        ? ""
        : `?category=${encodeURIComponent(categoryId)}`;
    return await apiGet<FaqSummary[]>(`/faqs${query}`);
  } catch (error) {
    try {
      return await fromOfflineSummaries(categoryId);
    } catch (offlineError) {
      if (offlineError instanceof ApiError) {
        throw offlineError;
      }
      throw error;
    }
  }
}

export async function fetchFaq(faqId: string): Promise<Faq> {
  try {
    return await apiGet<Faq>(`/faqs/${encodeURIComponent(faqId)}`);
  } catch (error) {
    try {
      return await fromOfflineFaq(faqId);
    } catch {
      throw error;
    }
  }
}
