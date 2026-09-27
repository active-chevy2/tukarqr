import { toast } from "sonner";
import { trackQrCopy, trackQrDownload, trackQrExportFail, trackQrShare } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import { copyQrImageToClipboard } from "@/lib/clipboard-utils";
import {
  downloadQrAsPng,
  formatShortFilename,
  type QrRenderOptions,
} from "@/lib/qr-render";
import { shareQrImage } from "@/lib/share-qr";

export type QrExportAction = "download" | "copy" | "share";

export async function runQrExportAction(
  action: QrExportAction,
  svg: SVGSVGElement,
  renderOptions: QrRenderOptions,
  merchantName: string | null
): Promise<void> {
  const filename = formatShortFilename(merchantName);
  const layout = renderOptions.layout ?? "duitnow";
  const ratio = renderOptions.ratio ?? "1:1";

  try {
    if (action === "download") {
      await downloadQrAsPng(svg, filename, renderOptions);
      trackQrDownload({ exportSource: "single", layout, ratio });
      return;
    }

    if (action === "copy") {
      await copyQrImageToClipboard(svg, renderOptions);
      toast.success(t("export.toast.copied"));
      trackQrCopy({ layout, ratio });
      return;
    }

    await shareQrImage(svg, renderOptions, filename, merchantName);
    toast.success(t("export.toast.shared"));
    trackQrShare({ layout, ratio });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      trackQrExportFail({
        action,
        exportSource: "single",
        layout,
        ratio,
      });
    }
    throw error;
  }
}
