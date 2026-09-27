import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/site-config", () => ({
  GA_MEASUREMENT_ID: "G-TEST",
}));

import {
  trackAppShare,
  trackLocaleChange,
  trackMcpCopy,
  trackQrCopy,
  trackQrDecode,
  trackQrDecodeFail,
  trackQrDownload,
  trackQrExportFail,
  trackQrShare,
  trackRatingSubmit,
} from "../analytics";

describe("analytics events", () => {
  const gtag = vi.fn();

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    gtag.mockReset();
  });

  function enableTracking() {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubGlobal("window", { gtag });
  }

  it("sends tukarqr_decode with count and source", () => {
    enableTracking();
    trackQrDecode({ count: 2, source: "camera" });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_decode",
      expect.objectContaining({
        count: 2,
        source: "camera",
        locale: "ms",
        theme: "system",
      })
    );
  });

  it("sends tukarqr_download for a single PNG without file_count", () => {
    enableTracking();
    trackQrDownload({
      exportSource: "single",
      layout: "duitnow",
      ratio: "3:4",
    });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_download",
      expect.objectContaining({
        export_source: "single",
        layout: "duitnow",
        ratio: "3:4",
      })
    );
  });

  it("sends tukarqr_download for a bulk ZIP with file_count", () => {
    enableTracking();
    trackQrDownload({
      exportSource: "bulk",
      layout: "plain",
      ratio: "1:1",
      fileCount: 4,
    });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_download",
      expect.objectContaining({
        export_source: "bulk",
        layout: "plain",
        ratio: "1:1",
        file_count: 4,
      })
    );
  });

  it("sends tukarqr_share as a single export", () => {
    enableTracking();
    trackQrShare({ layout: "duitnow", ratio: "1:1" });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_share",
      expect.objectContaining({
        export_source: "single",
        layout: "duitnow",
        ratio: "1:1",
      })
    );
  });

  it("sends tukarqr_copy with layout and ratio", () => {
    enableTracking();
    trackQrCopy({ layout: "plain", ratio: "1:1" });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_copy",
      expect.objectContaining({
        layout: "plain",
        ratio: "1:1",
      })
    );
  });

  it("sends tukarqr_app_share with method", () => {
    enableTracking();
    trackAppShare({ method: "clipboard" });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_app_share",
      expect.objectContaining({
        method: "clipboard",
      })
    );
  });

  it("sends failure and rating events", () => {
    enableTracking();
    trackQrDecodeFail({ count: 1, source: "upload" });
    trackQrExportFail({
      action: "share",
      exportSource: "single",
      layout: "duitnow",
      ratio: "1:1",
    });
    trackRatingSubmit({ value: 2, hasFeedback: true });
    trackMcpCopy("endpoint");
    trackLocaleChange("en");

    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_decode_fail",
      expect.objectContaining({ count: 1, source: "upload" })
    );
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_export_fail",
      expect.objectContaining({ action: "share", export_source: "single" })
    );
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_rating_submit",
      expect.objectContaining({ value: 2, has_feedback: true })
    );
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_mcp_copy",
      expect.objectContaining({ target: "endpoint" })
    );
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "tukarqr_locale_change",
      expect.objectContaining({ to: "en" })
    );
  });

  it("does nothing outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("window", { gtag });
    trackQrShare({ layout: "duitnow", ratio: "1:1" });
    expect(gtag).not.toHaveBeenCalled();
  });

  it("does nothing when gtag is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubGlobal("window", {});
    trackQrDecode({ count: 1, source: "upload" });
    expect(gtag).not.toHaveBeenCalled();
  });

  it("does nothing when the measurement id is empty", async () => {
    vi.resetModules();
    vi.doMock("@/lib/site-config", () => ({
      GA_MEASUREMENT_ID: "",
    }));
    vi.stubEnv("NODE_ENV", "production");
    vi.stubGlobal("window", { gtag });
    const { trackQrDownload: trackWithoutId } = await import("../analytics");
    trackWithoutId({
      exportSource: "single",
      layout: "duitnow",
      ratio: "1:1",
    });
    expect(gtag).not.toHaveBeenCalled();
  });
});
