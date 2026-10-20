import type { Faq, FaqCategory, FaqSummary } from "@/lib/types";

export interface OfflineFaqPack {
  version: number;
  categories: FaqCategory[];
  faqs: Faq[];
  audioUrls: string[];
}

const PACK_URL = "/offline/top-faqs.json";

let packPromise: Promise<OfflineFaqPack> | null = null;

/** Load the curated offline FAQ pack from the same origin (service-worker cached). */
export function loadOfflineFaqPack(): Promise<OfflineFaqPack> {
  if (!packPromise) {
    packPromise = fetch(PACK_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Offline FAQ pack unavailable (${response.status})`);
        }
        return (await response.json()) as OfflineFaqPack;
      })
      .catch((error) => {
        packPromise = null;
        throw error;
      });
  }
  return packPromise;
}

export function offlineCategories(pack: OfflineFaqPack): FaqCategory[] {
  return [...pack.categories].sort((a, b) => a.order - b.order);
}

export function offlineFaqSummaries(
  pack: OfflineFaqPack,
  categoryId?: string,
): FaqSummary[] {
  const faqs =
    categoryId == null || categoryId === ""
      ? pack.faqs
      : pack.faqs.filter((faq) => faq.category === categoryId);

  return faqs.map((faq) => ({
    id: faq.id,
    category: faq.category,
    questionPs: faq.questionPs,
    questionEn: faq.questionEn,
    dangerLevel: faq.dangerLevel,
    audioUrl: faq.audioUrl,
  }));
}

export function offlineFaqById(pack: OfflineFaqPack, faqId: string): Faq | null {
  return pack.faqs.find((faq) => faq.id === faqId) ?? null;
}

/**
 * Ensure listed offline audio URLs are in Cache Storage.
 * No-op while audioUrls is empty (recordings not shipped yet).
 */
export async function warmOfflineAudioCache(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  let pack: OfflineFaqPack;
  try {
    pack = await loadOfflineFaqPack();
  } catch {
    return;
  }

  const urls = pack.audioUrls.filter(
    (url) => typeof url === "string" && url.trim().length > 0,
  );
  if (urls.length === 0) {
    return;
  }

  const cache = await caches.open("sehatyar-offline-v1");
  await Promise.all(
    urls.map(async (url) => {
      try {
        const absolute = new URL(url, window.location.origin).href;
        const existing = await cache.match(absolute);
        if (!existing) {
          await cache.add(absolute);
        }
      } catch {
        /* skip missing or blocked audio */
      }
    }),
  );
}
