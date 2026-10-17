/** Browser-side checks for medicine pack photos before upload. */

export const MEDICINE_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/*";
export const MEDICINE_PHOTO_MAX_BYTES = 8 * 1024 * 1024;

export type MedicinePhotoError = "type" | "size";

export function validateMedicinePhoto(file: File): MedicinePhotoError | null {
  if (!file.type.startsWith("image/")) {
    return "type";
  }
  if (file.size <= 0 || file.size > MEDICINE_PHOTO_MAX_BYTES) {
    return "size";
  }
  return null;
}
