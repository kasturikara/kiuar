// Download utilities for QR codes
export const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

export const downloadAllAsZip = async (
  items: { dataUrl: string; filename: string }[]
): Promise<void> => {
  // Implementation for batch download - can use JSZip if needed
  for (const item of items) {
    downloadImage(item.dataUrl, item.filename);
  }
};
