export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tukarqr.my";

export const DEFAULT_OG_IMAGE = "/og-image.png";
export const ABOUT_OG_IMAGE = "/about.png";
export const MCP_OG_IMAGE = "/mcp-image.png";

export const SITE_ICONS = {
  favicon: "/favicon.ico",
  favicon16: "/favicon-16x16.png",
  favicon32: "/favicon-32x32.png",
  appleTouch: "/apple-touch-icon.png",
  android192: "/android-chrome-192x192.png",
  android512: "/android-chrome-512x512.png",
} as const;

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-HNKBBJPS5M";
