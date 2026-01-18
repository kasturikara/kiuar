// Hook for CSV file upload and parsing
import { useCallback } from "react";
import { parseCSV } from "@/utils";
import { isValidUrl, normalizeUrl } from "@/utils";

export const useCSVUpload = () => {
  const parseFile = useCallback(
    (file: File): Promise<string[]> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const urls = parseCSV(content).map(normalizeUrl).filter(isValidUrl);
          resolve(urls);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      }),
    []
  );

  return { parseFile };
};
