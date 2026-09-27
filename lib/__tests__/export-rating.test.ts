import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildRatingEmbedDescription,
  isValidRatingFeedback,
  needsRatingFeedback,
  RATING_WEBHOOK_NOT_CONFIGURED_ERROR,
  submitRatingToDiscord,
} from "../export-rating";

describe("needsRatingFeedback", () => {
  it("returns true for ratings 1 through 3", () => {
    expect(needsRatingFeedback(1)).toBe(true);
    expect(needsRatingFeedback(2)).toBe(true);
    expect(needsRatingFeedback(3)).toBe(true);
  });

  it("returns false for ratings 4 and 5", () => {
    expect(needsRatingFeedback(4)).toBe(false);
    expect(needsRatingFeedback(5)).toBe(false);
  });
});

describe("isValidRatingFeedback", () => {
  it("requires at least 10 trimmed characters", () => {
    expect(isValidRatingFeedback("pendek")).toBe(false);
    expect(isValidRatingFeedback("123456789")).toBe(false);
    expect(isValidRatingFeedback("1234567890")).toBe(true);
    expect(isValidRatingFeedback("  1234567890  ")).toBe(true);
  });
});

describe("buildRatingEmbedDescription", () => {
  it("includes only the star value when feedback is absent", () => {
    expect(buildRatingEmbedDescription(5)).toBe("Pengguna memberi 5/5 bintang");
  });

  it("includes feedback when provided", () => {
    expect(buildRatingEmbedDescription(2, "QR lambat dimuat turun")).toBe(
      "Pengguna memberi 2/5 bintang\n\nMaklum balas:\nQR lambat dimuat turun"
    );
  });
});

describe("submitRatingToDiscord", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts the rating to the same-origin API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitRatingToDiscord(2, "QR lambat dimuat turun");

    expect(fetchMock).toHaveBeenCalledWith("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: 2,
        feedback: "QR lambat dimuat turun",
      }),
    });
  });

  it("throws when the rating API is not configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ ok: false, error: "not_configured" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitRatingToDiscord(4)).rejects.toThrow(
      RATING_WEBHOOK_NOT_CONFIGURED_ERROR
    );
  });

  it("throws when the rating API is missing in local dev", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => null,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitRatingToDiscord(4)).rejects.toThrow(
      RATING_WEBHOOK_NOT_CONFIGURED_ERROR
    );
  });
});
