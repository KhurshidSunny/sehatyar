import { apiPostForm } from "@/lib/api/client";
import type { MedicineOcrResponse } from "@/lib/types";

export function postMedicineOcr(file: File): Promise<MedicineOcrResponse> {
  const form = new FormData();
  form.append("image", file);
  return apiPostForm<MedicineOcrResponse>("/medicines/ocr", form);
}
