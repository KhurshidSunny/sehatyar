/** Browser-facing API base URL from env (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Copy apps/web/.env.example to .env.local.",
    );
  }
  return raw.replace(/\/+$/, "");
}
