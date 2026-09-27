import { GA_MEASUREMENT_ID } from "@/lib/site-config";
import { getCurrentLocale } from "@/lib/i18n/locale-store";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type QrExportSource = "single" | "bulk";
export type QrLayoutParam = "duitnow" | "plain";
export type QrRatioParam = "1:1" | "3:4";
export type QrDecodeSource = "upload" | "camera";
export type AppShareMethod = "native" | "clipboard";
export type QrExportActionParam = "download" | "copy" | "share";
export type AnalyticsTheme = "light" | "dark" | "system";
export type McpCopyTarget = "endpoint" | "install" | "prompt";

type EventParams = Record<string, string | number | boolean>;

function readTheme(): AnalyticsTheme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage?.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore
  }
  if (typeof document !== "undefined" && document.documentElement?.classList.contains("dark")) {
    return "dark";
  }
  return "system";
}

function getAnalyticsContext(): EventParams {
  if (typeof window === "undefined") return {};
  const page =
    typeof window.location?.pathname === "string" && window.location.pathname
      ? window.location.pathname
      : "/";
  return {
    locale: getCurrentLocale(),
    page,
    theme: readTheme(),
  };
}

function canTrack(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    GA_MEASUREMENT_ID.length > 0 &&
    typeof window !== "undefined" &&
    typeof window.gtag === "function"
  );
}

function trackEvent(name: string, params?: EventParams): void {
  if (!canTrack()) return;
  try {
    window.gtag?.("event", name, { ...getAnalyticsContext(), ...params });
  } catch {
    // Fire-and-forget: product actions must not depend on analytics delivery.
  }
}

/**
 * User successfully decoded one or more QR images.
 * Event: tukarqr_decode — params: count, source (upload | camera).
 */
export function trackQrDecode(input: {
  count: number;
  source: QrDecodeSource;
}): void {
  trackEvent("tukarqr_decode", {
    count: input.count,
    source: input.source,
  });
}

/**
 * User downloaded a QR PNG (single) or a ZIP of PNGs (bulk).
 * Event: tukarqr_download — params: export_source, layout, ratio, file_count (bulk only).
 */
export function trackQrDownload(input: {
  exportSource: QrExportSource;
  layout: QrLayoutParam;
  ratio: QrRatioParam;
  fileCount?: number;
}): void {
  const params: EventParams = {
    export_source: input.exportSource,
    layout: input.layout,
    ratio: input.ratio,
  };
  if (input.exportSource === "bulk" && input.fileCount !== undefined) {
    params.file_count = input.fileCount;
  }
  trackEvent("tukarqr_download", params);
}

/**
 * User shared a QR image through the device share sheet.
 * Event: tukarqr_share — params: export_source (single), layout, ratio.
 */
export function trackQrShare(input: {
  layout: QrLayoutParam;
  ratio: QrRatioParam;
}): void {
  trackEvent("tukarqr_share", {
    export_source: "single",
    layout: input.layout,
    ratio: input.ratio,
  });
}

/**
 * User copied a QR image to the clipboard.
 * Event: tukarqr_copy — params: layout, ratio.
 */
export function trackQrCopy(input: {
  layout: QrLayoutParam;
  ratio: QrRatioParam;
}): void {
  trackEvent("tukarqr_copy", {
    layout: input.layout,
    ratio: input.ratio,
  });
}

/**
 * User shared the TukarQR site link from the rating prompt.
 * Event: tukarqr_app_share — params: method (native | clipboard).
 */
export function trackAppShare(input: { method: AppShareMethod }): void {
  trackEvent("tukarqr_app_share", { method: input.method });
}

/**
 * One or more images in a decode batch failed.
 * Event: tukarqr_decode_fail — params: count, source (upload | camera).
 */
export function trackQrDecodeFail(input: {
  count: number;
  source: QrDecodeSource;
}): void {
  trackEvent("tukarqr_decode_fail", {
    count: input.count,
    source: input.source,
  });
}

/**
 * Download, copy, or share failed after the user started the action.
 * Event: tukarqr_export_fail — params: action, export_source, layout, ratio.
 */
export function trackQrExportFail(input: {
  action: QrExportActionParam;
  exportSource: QrExportSource;
  layout: QrLayoutParam;
  ratio: QrRatioParam;
}): void {
  trackEvent("tukarqr_export_fail", {
    action: input.action,
    export_source: input.exportSource,
    layout: input.layout,
    ratio: input.ratio,
  });
}

/**
 * User submitted a star rating. Feedback text stays on the rating API, not GA4.
 * Event: tukarqr_rating_submit — params: value (1–5), has_feedback.
 */
export function trackRatingSubmit(input: {
  value: number;
  hasFeedback: boolean;
}): void {
  trackEvent("tukarqr_rating_submit", {
    value: input.value,
    has_feedback: input.hasFeedback,
  });
}

/**
 * User copied the MCP endpoint, install JSON, or a sample prompt.
 * Event: tukarqr_mcp_copy — params: target (endpoint | install | prompt).
 */
export function trackMcpCopy(target: McpCopyTarget): void {
  trackEvent("tukarqr_mcp_copy", { target });
}

/**
 * User switched the site language.
 * Event: tukarqr_locale_change — params: to (ms | en). Context locale is the new value.
 */
export function trackLocaleChange(to: "ms" | "en"): void {
  trackEvent("tukarqr_locale_change", { to });
}
