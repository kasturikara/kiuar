// CSV Upload component with drag & drop
import { useCallback } from "react";
import { useCSVUpload } from "../hooks";
import { useGeneratorStore } from "../store";
import { downloadCSVTemplate } from "@/utils";

export const CSVUploader = () => {
  const { parseFile } = useCSVUpload();
  const addUrls = useGeneratorStore((state) => state.addUrls);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const urls = await parseFile(file);
        addUrls(urls);
      }
    },
    [parseFile, addUrls]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full max-w-xs"
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={downloadCSVTemplate}
        >
          Download Template
        </button>
      </div>
    </div>
  );
};
