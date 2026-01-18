// Hook for generating QR codes using the qrcode package
import { useCallback } from "react";
import QRCode from "qrcode";
import type { QRCodeGenerateOptions, QRItem, CreateQRItemDTO } from "@/types";
import { batchApi, qrItemApi } from "@/services";
import { generateShortCode } from "@/utils";

interface GeneratedQRItem extends QRItem {
  dataUrl: string;
}

interface GenerateBatchParams {
  urls: string[];
  title: string;
  source: "manual" | "csv";
  options?: QRCodeGenerateOptions;
}

export const useQRCodeGenerator = () => {
  // Generate QR code data URL from text
  const generateQRDataUrl = useCallback(
    async (text: string, options?: QRCodeGenerateOptions): Promise<string> => {
      return QRCode.toDataURL(text, {
        width: options?.width ?? 256,
        margin: options?.margin ?? 2,
        color: options?.color,
      });
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
    }: GenerateBatchParams): Promise<GeneratedQRItem[]> => {
      // 1. Create batch record
      const batch = await batchApi.create({
        title: title || `Batch ${new Date().toLocaleDateString()}`,
        source,
      });

      // 2. Generate QR codes and prepare items
      const itemsToCreate: (CreateQRItemDTO & { dataUrl: string })[] =
        await Promise.all(
          urls.map(async (url) => {
            const shortCode = generateShortCode();
            const redirectUrl = `${window.location.origin}/r/${shortCode}`;
            const dataUrl = await generateQRDataUrl(redirectUrl, options);

            return {
              batch_id: batch.id,
              original_url: url,
              qr_code_url: dataUrl, // Store data URL (or upload to storage)
              short_code: shortCode,
              dataUrl,
            };
          })
        );

      // 3. Save QR items to database (exclude dataUrl from DB insert)
      const itemsForDb = itemsToCreate.map((item) => ({
        batch_id: item.batch_id,
        original_url: item.original_url,
        qr_code_url: item.qr_code_url,
        short_code: item.short_code,
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
      options?: QRCodeGenerateOptions
    ): Promise<{ url: string; dataUrl: string }> => {
      const dataUrl = await generateQRDataUrl(url, options);
      return { url, dataUrl };
    },
    [generateQRDataUrl]
  );

  return { generateQRDataUrl, generateBatch, generatePreview };
};
