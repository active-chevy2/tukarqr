export const MAX_RATING_FEEDBACK_LENGTH = 500;

export function buildRatingEmbedDescription(
  value: number,
  feedback?: string
): string {
  const lines = [`Pengguna memberi ${value}/5 bintang`];
  if (feedback?.trim()) {
    lines.push("", "Maklum balas:", feedback.trim());
  }
  return lines.join("\n");
}

export function buildDiscordRatingPayload(value: number, feedback?: string) {
  return {
    embeds: [
      {
        title: "Penilaian TukarQR",
        description: buildRatingEmbedDescription(value, feedback),
        color: 5814783,
      },
    ],
  };
}

export interface RatingSubmission {
  value: number;
  feedback?: string;
}

export function parseRatingSubmission(
  input: unknown
): { ok: true; submission: RatingSubmission } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const value = (input as { value?: unknown }).value;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    return { ok: false, error: "invalid_value" };
  }

  const rawFeedback = (input as { feedback?: unknown }).feedback;
  if (rawFeedback === undefined || rawFeedback === null || rawFeedback === "") {
    return { ok: true, submission: { value } };
  }

  if (typeof rawFeedback !== "string") {
    return { ok: false, error: "invalid_feedback" };
  }

  const feedback = rawFeedback.trim();
  if (feedback.length > MAX_RATING_FEEDBACK_LENGTH) {
    return { ok: false, error: "feedback_too_long" };
  }

  return {
    ok: true,
    submission: feedback ? { value, feedback } : { value },
  };
}

const ALLOWED_ORIGINS = new Set([
  "https://tukarqr.my",
  "https://www.tukarqr.my",
]);

export function isAllowedRatingOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
