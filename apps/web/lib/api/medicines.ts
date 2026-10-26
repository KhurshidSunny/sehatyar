import { apiGet, apiPostForm } from "@/lib/api/client";
import type {
  MedicineForm,
  MedicineOcrResponse,
  MedicineSummary,
} from "@/lib/types";

export function fetchMedicineForms(): Promise<MedicineForm[]> {
  return apiGet<MedicineForm[]>("/medicines/forms");
}

export function postMedicineOcr(
  file: File,
  options?: { form?: string | null },
): Promise<MedicineOcrResponse> {
  const form = new FormData();
  form.append("image", file);
  const params = new URLSearchParams();
  const formId = options?.form?.trim();
  if (formId && formId !== "any") {
    params.set("form", formId);
  }
  const query = params.toString();
  const path = query ? `/medicines/ocr?${query}` : "/medicines/ocr";
  return apiPostForm<MedicineOcrResponse>(path, form);
}

export function searchMedicines(
  query: string,
  limit = 10,
  options?: { form?: string | null },
): Promise<MedicineSummary[]> {
  const q = query.trim();
  const params = new URLSearchParams({
    q,
    limit: String(limit),
  });
  const formId = options?.form?.trim();
  if (formId && formId !== "any") {
    params.set("form", formId);
  }
  return apiGet<MedicineSummary[]>(`/medicines/search?${params.toString()}`);
}
