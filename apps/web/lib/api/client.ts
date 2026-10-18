import { getApiBaseUrl } from "@/lib/api/config";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let detail = response.statusText || "Request failed";
  try {
    const body = (await response.json()) as { detail?: string };
    if (typeof body.detail === "string" && body.detail.trim()) {
      detail = body.detail;
    }
  } catch {
    // keep statusText
  }
  return new ApiError(response.status, detail);
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Network error");
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Network error");
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}

/** Multipart POST (do not set Content-Type — the browser sets the boundary). */
export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Network error");
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}
