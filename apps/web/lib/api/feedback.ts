import { apiPost } from "@/lib/api/client";
import type { FeedbackCreate, FeedbackRecord } from "@/lib/types";

export function postFeedback(payload: FeedbackCreate): Promise<FeedbackRecord> {
  return apiPost<FeedbackRecord>("/feedback", payload);
}
