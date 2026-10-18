import { apiGet, apiPostForm } from "@/lib/api/client";
import type { MedicineOcrResponse, MedicineSummary } from "@/lib/types";

export function postMedicineOcr(file: File): Promise<MedicineOcrResponse> {
  const form = new FormData();
  form.append("image", file);
  return apiPostForm<MedicineOcrResponse>("/medicines/ocr", form);
}

export function searchMedicines(
  query: string,
  limit = 10,
): Promise<MedicineSummary[]> {
  const q = query.trim();
  const params = new URLSearchParams({
    q,
    limit: String(limit),
  });
  return apiGet<MedicineSummary[]>(`/medicines/search?${params.toString()}`);
}
