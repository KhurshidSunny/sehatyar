import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Faq, FaqCategory, FaqSummary } from "@/lib/types";

// Resolved from apps/web, the working directory for `next dev` and `next build`.
const FAQ_DIR = path.join(process.cwd(), "..", "..", "data", "faqs");
const CATEGORIES_FILE = "categories.json";

type FaqCatalog = {
  categories: FaqCategory[];
  faqs: Faq[];
};

let catalog: Promise<FaqCatalog> | undefined;

async function readJson<T>(fileName: string): Promise<T> {
  const raw = await readFile(path.join(FAQ_DIR, fileName), "utf-8");
  return JSON.parse(raw) as T;
}

async function loadCatalog(): Promise<FaqCatalog> {
  const categories = await readJson<FaqCategory[]>(CATEGORIES_FILE);
  const files = (await readdir(FAQ_DIR))
    .filter((name) => name.endsWith(".json") && name !== CATEGORIES_FILE)
    .sort();
  const faqs = (await Promise.all(files.map((name) => readJson<Faq[]>(name)))).flat();

  return {
    categories: [...categories].sort((a, b) => a.order - b.order),
    faqs,
  };
}

function getCatalog(): Promise<FaqCatalog> {
  catalog ??= loadCatalog();
  return catalog;
}

function toSummary(faq: Faq): FaqSummary {
  return {
    id: faq.id,
    category: faq.category,
    questionPs: faq.questionPs,
    dangerLevel: faq.dangerLevel,
    audioUrl: faq.audioUrl,
  };
}

export async function getFaqCategories(): Promise<FaqCategory[]> {
  return (await getCatalog()).categories;
}

export async function getFaqCategory(id: string): Promise<FaqCategory | undefined> {
  return (await getCatalog()).categories.find((category) => category.id === id);
}

export async function getFaqSummaries(categoryId: string): Promise<FaqSummary[]> {
  return (await getCatalog()).faqs
    .filter((faq) => faq.category === categoryId)
    .map(toSummary);
}

export async function getFaq(id: string): Promise<Faq | undefined> {
  return (await getCatalog()).faqs.find((faq) => faq.id === id);
}

export async function getAllFaqs(): Promise<Faq[]> {
  return (await getCatalog()).faqs;
}
