import { describe, expect, it } from "vitest";
import {
  buildDiscordRatingPayload,
  isAllowedRatingOrigin,
  parseRatingSubmission,
} from "../rating-message";

describe("parseRatingSubmission", () => {
  it("accepts a star value without feedback", () => {
    expect(parseRatingSubmission({ value: 5 })).toEqual({
      ok: true,
      submission: { value: 5 },
    });
  });

  it("keeps trimmed feedback", () => {
    expect(parseRatingSubmission({ value: 2, feedback: "  lambat  " })).toEqual({
      ok: true,
      submission: { value: 2, feedback: "lambat" },
    });
  });

  it("rejects values outside 1 to 5", () => {
    expect(parseRatingSubmission({ value: 0 }).ok).toBe(false);
    expect(parseRatingSubmission({ value: 6 }).ok).toBe(false);
  });

  it("rejects feedback longer than 500 characters", () => {
    const result = parseRatingSubmission({ value: 1, feedback: "a".repeat(501) });
    expect(result).toEqual({ ok: false, error: "feedback_too_long" });
  });
});

describe("isAllowedRatingOrigin", () => {
  it("allows the production site and localhost", () => {
    expect(isAllowedRatingOrigin("https://tukarqr.my")).toBe(true);
    expect(isAllowedRatingOrigin("http://localhost:3000")).toBe(true);
  });

  it("rejects other sites and a missing origin", () => {
    expect(isAllowedRatingOrigin("https://evil.example")).toBe(false);
    expect(isAllowedRatingOrigin(null)).toBe(false);
  });
});

describe("buildDiscordRatingPayload", () => {
  it("does not include the webhook url", () => {
    const payload = buildDiscordRatingPayload(4);
    expect(JSON.stringify(payload)).not.toContain("discord.com/api/webhooks");
    expect(payload.embeds[0].description).toBe("Pengguna memberi 4/5 bintang");
  });
});
