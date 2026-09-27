import { buildRatingEmbedDescription } from "@/lib/rating-message";

const RATING_SUBMITTED_KEY = "qrkita-rating-submitted";
const RATING_VALUE_KEY = "qrkita-rating-value";

export const MIN_RATING_FEEDBACK_LENGTH = 10;
export const RATING_WEBHOOK_NOT_CONFIGURED_ERROR =
  "RATING_WEBHOOK_NOT_CONFIGURED";

export { buildRatingEmbedDescription };

export function hasSubmittedRating(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(RATING_SUBMITTED_KEY) === "true";
}

export function getSavedRating(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(RATING_VALUE_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return value >= 1 && value <= 5 ? value : null;
}

export function saveRating(value: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RATING_SUBMITTED_KEY, "true");
  localStorage.setItem(RATING_VALUE_KEY, String(value));
}

export function clearSubmittedRating(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RATING_SUBMITTED_KEY);
  localStorage.removeItem(RATING_VALUE_KEY);
}

export function needsRatingFeedback(value: number): boolean {
  return value >= 1 && value <= 3;
}

export function isValidRatingFeedback(feedback: string): boolean {
  return feedback.trim().length >= MIN_RATING_FEEDBACK_LENGTH;
}

export async function submitRatingToDiscord(
  value: number,
  feedback?: string
): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value,
        ...(feedback?.trim() ? { feedback: feedback.trim() } : {}),
      }),
    });
  } catch {
    throw new Error(RATING_WEBHOOK_NOT_CONFIGURED_ERROR);
  }

  if (response.status === 404 || response.status === 405) {
    throw new Error(RATING_WEBHOOK_NOT_CONFIGURED_ERROR);
  }

  const body = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
  } | null;

  if (!response.ok || !body?.ok) {
    if (body?.error === "not_configured" || response.status === 503) {
      throw new Error(RATING_WEBHOOK_NOT_CONFIGURED_ERROR);
    }
    throw new Error("RATING_SUBMIT_FAILED");
  }
}
