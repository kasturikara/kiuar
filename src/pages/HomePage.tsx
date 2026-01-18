// Home page - main QR generator interface
import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";
import {
  URLInputForm,
  CSVUploader,
  URLList,
  QRPreviewGrid,
  useQRCodeGenerator,
  useGeneratorStore,
} from "@/features/generator";
import { downloadImage } from "@/utils";
import type { QRItem } from "@/types";

const HomePage = () => {
  const urls = useGeneratorStore((state) => state.urls);
  const options = useGeneratorStore((state) => state.options);
  const batchTitle = useGeneratorStore((state) => state.batchTitle);
  const batchSource = useGeneratorStore((state) => state.batchSource);
  const setBatchTitle = useGeneratorStore((state) => state.setBatchTitle);
  const setGeneratedItems = useGeneratorStore(
    (state) => state.setGeneratedItems
  );
  const generatedItems = useGeneratorStore((state) => state.generatedItems);
  const clearUrls = useGeneratorStore((state) => state.clearUrls);

  const { generateBatch } = useQRCodeGenerator();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (urls.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const results = await generateBatch({
        urls,
        title: batchTitle,
        source: batchSource,
        options,
      });
      setGeneratedItems(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR codes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (dataUrl: string, item: QRItem) => {
    const hostname = new URL(item.original_url).hostname;
    downloadImage(dataUrl, `qr-${hostname}-${item.short_code}.png`);
  };

  const handleReset = () => {
    clearUrls();
    setBatchTitle("");
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-base-content/70">
          Generate QR codes for multiple URLs at once
        </p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Batch Settings</h2>
        <Input
          label="Batch Title"
          placeholder="Enter a name for this batch (optional)"
          value={batchTitle}
          onChange={(e) => setBatchTitle(e.target.value)}
        />
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Add URLs</h2>
        <div className="space-y-4">
          <URLInputForm />
          <div className="divider">OR</div>
          <CSVUploader />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">URL List</h2>
        <URLList />
        {urls.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleGenerate} loading={loading}>
              Generate QR Codes ({urls.length})
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          </div>
        )}
        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}
      </Card>

      {generatedItems.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Generated QR Codes ({generatedItems.length})
          </h2>
          <QRPreviewGrid
            items={generatedItems.map((item) => ({
              url: item.original_url,
              dataUrl: item.dataUrl,
              shortCode: item.short_code,
              item,
            }))}
            onDownload={(dataUrl, _, item) => handleDownload(dataUrl, item!)}
          />
        </Card>
      )}
    </div>
  );
};

export default HomePage;
