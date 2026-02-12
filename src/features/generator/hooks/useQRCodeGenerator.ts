// Hook for generating QR codes using the qrcode package
import { useCallback } from "react";
import QRCode from "qrcode";
import type { QRCodeGenerateOptions, QRItem, CreateQRItemDTO } from "@/types";
import { batchApi, qrItemApi } from "@/services";
import { generateShortCode } from "@/utils";

// Constants for logo overlay
const LOGO_SIZE_RATIO = 0.2;
const LOGO_PADDING_RATIO = 0.02;

// Helper: load an image from a data URL
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Helper: overlay logo onto a QR canvas (preserves aspect ratio)
const overlayLogoOnCanvas = (
  canvas: HTMLCanvasElement,
  logoImg: HTMLImageElement
): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2d context");

  const qrSize = canvas.width;
  const logoSize = Math.floor(qrSize * LOGO_SIZE_RATIO);
  const padding = Math.floor(qrSize * LOGO_PADDING_RATIO);

  // Calculate aspect-ratio-preserving dimensions
  const aspectRatio = logoImg.width / logoImg.height;
  let drawWidth = logoSize;
  let drawHeight = logoSize;
  if (aspectRatio > 1) {
    drawHeight = Math.floor(logoSize / aspectRatio);
  } else {
    drawWidth = Math.floor(logoSize * aspectRatio);
  }

  const x = Math.floor((qrSize - drawWidth) / 2);
  const y = Math.floor((qrSize - drawHeight) / 2);

  // Draw white background behind logo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    x - padding,
    y - padding,
    drawWidth + padding * 2,
    drawHeight + padding * 2
  );

  // Draw the logo image
  ctx.drawImage(logoImg, x, y, drawWidth, drawHeight);
};

interface GeneratedQRItem extends QRItem {
  dataUrl: string;
}

interface GenerateBatchParams {
  urls: string[];
  title: string;
  source: "manual" | "csv";
  options?: QRCodeGenerateOptions;
  itemName?: string;
  logoDataUrl?: string;
}

export const useQRCodeGenerator = () => {
  // Generate QR code data URL from text, optionally with logo overlay
  const generateQRDataUrl = useCallback(
    async (
      text: string,
      options?: QRCodeGenerateOptions,
      logoImg?: HTMLImageElement
    ): Promise<string> => {
      const errorCorrectionLevel =
        options?.errorCorrectionLevel ?? (logoImg ? "H" : "M");

      if (logoImg) {
        // Canvas-based approach: render QR to canvas, overlay logo, export
        const canvas = document.createElement("canvas");
        await QRCode.toCanvas(canvas, text, {
          width: options?.width ?? 256,
          margin: options?.margin ?? 2,
          color: options?.color,
          errorCorrectionLevel,
        });
        overlayLogoOnCanvas(canvas, logoImg);
        return canvas.toDataURL("image/png");
      } else {
        return QRCode.toDataURL(text, {
          width: options?.width ?? 256,
          margin: options?.margin ?? 2,
          color: options?.color,
          errorCorrectionLevel,
        });
      }
    },
    []
  );

  // Generate batch of QR codes and save to Supabase
  const generateBatch = useCallback(
    async ({
      urls,
      title,
      source,
      options,
      itemName,
      logoDataUrl,
    }: GenerateBatchParams): Promise<GeneratedQRItem[]> => {
      // Pre-load logo image once for the entire batch
      let logoImg: HTMLImageElement | undefined;
      if (logoDataUrl) {
        logoImg = await loadImage(logoDataUrl);
      }

      // 1. Create batch record
      const batch = await batchApi.create({
        title: title || `Batch ${new Date().toLocaleDateString()}`,
        source,
      });

      // 2. Generate QR codes and prepare items
      const itemsToCreate: (CreateQRItemDTO & { dataUrl: string })[] =
        await Promise.all(
          urls.map(async (url, index) => {
            const shortCode = generateShortCode();
            const dataUrl = await generateQRDataUrl(url, options, logoImg);

            return {
              batch_id: batch.id,
              original_url: url,
              qr_code_url: dataUrl,
              short_code: shortCode,
              ...(itemName ? { name: `${itemName} ${index + 1}` } : {}),
              dataUrl,
            };
          })
        );

      // 3. Save QR items to database (exclude dataUrl from DB insert)
      const itemsForDb: CreateQRItemDTO[] = itemsToCreate.map((item) => ({
        batch_id: item.batch_id,
        original_url: item.original_url,
        qr_code_url: item.qr_code_url,
        short_code: item.short_code,
        ...(item.name ? { name: item.name } : {}),
      }));
      const createdItems = await qrItemApi.createMany(itemsForDb);

      // 4. Update batch total
      await batchApi.updateTotalQR(batch.id, createdItems.length);

      // 5. Return items with data URLs for display
      return createdItems.map((item, index) => ({
        ...item,
        dataUrl: itemsToCreate[index].dataUrl,
      }));
    },
    [generateQRDataUrl]
  );

  // Generate single QR code (preview only, not saved)
  const generatePreview = useCallback(
    async (
      url: string,
      options?: QRCodeGenerateOptions,
      logoDataUrl?: string
    ): Promise<{ url: string; dataUrl: string }> => {
      let logoImg: HTMLImageElement | undefined;
      if (logoDataUrl) {
        logoImg = await loadImage(logoDataUrl);
      }
      const dataUrl = await generateQRDataUrl(url, options, logoImg);
      return { url, dataUrl };
    },
    [generateQRDataUrl]
  );

  return { generateQRDataUrl, generateBatch, generatePreview };
};
