// History page - displays all generated QR batches and items
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Modal } from "@/components/ui";
import { batchApi, qrItemApi } from "@/services";
import { downloadImage } from "@/utils";
import { env } from "@/config";
import type { QRBatch, QRItem } from "@/types";
import QRCode from "qrcode";
import JSZip from "jszip";

const HistoryPage = () => {
  const [batches, setBatches] = useState<QRBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [items, setItems] = useState<QRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingBatch, setDownloadingBatch] = useState(false);

  // QR Preview Modal state
  const [previewItem, setPreviewItem] = useState<QRItem | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  // Generate QR code data URL for preview/download
  const generateQRDataUrl = useCallback(
    async (shortCode: string): Promise<string> => {
      const redirectUrl = `${env.APP_URL}/r/${shortCode}`;
      return QRCode.toDataURL(redirectUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    },
    []
  );

  // Open preview modal
  const handleViewQR = useCallback(
    async (item: QRItem) => {
      setPreviewItem(item);
      setGeneratingQR(true);
      try {
        const dataUrl = await generateQRDataUrl(item.short_code);
        setPreviewDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      } finally {
        setGeneratingQR(false);
      }
    },
    [generateQRDataUrl]
  );

  // Close preview modal
  const handleClosePreview = useCallback(() => {
    setPreviewItem(null);
    setPreviewDataUrl(null);
  }, []);

  // Download single QR code
  const handleDownloadQR = useCallback(
    async (item: QRItem) => {
      try {
        const dataUrl = await generateQRDataUrl(item.short_code);
        const hostname = new URL(item.original_url).hostname;
        downloadImage(dataUrl, `qr-${hostname}-${item.short_code}.png`);
      } catch (err) {
        console.error("Failed to download QR code:", err);
      }
    },
    [generateQRDataUrl]
  );

  // Download from preview modal
  const handleDownloadFromPreview = useCallback(() => {
    if (previewItem && previewDataUrl) {
      const hostname = new URL(previewItem.original_url).hostname;
      downloadImage(
        previewDataUrl,
        `qr-${hostname}-${previewItem.short_code}.png`
      );
    }
  }, [previewItem, previewDataUrl]);

  // Download all QR codes in batch as ZIP
  const handleDownloadBatchAsZip = useCallback(async () => {
    if (!selectedBatch || items.length === 0) return;

    setDownloadingBatch(true);
    try {
      const zip = new JSZip();
      const batch = batches.find((b) => b.id === selectedBatch);
      const folderName = batch?.title || "qr-codes";

      // Generate QR codes and add to ZIP
      for (const item of items) {
        const dataUrl = await generateQRDataUrl(item.short_code);
        // Convert data URL to base64
        const base64Data = dataUrl.split(",")[1];
        const hostname = new URL(item.original_url).hostname;
        const filename = `qr-${hostname}-${item.short_code}.png`;
        zip.file(filename, base64Data, { base64: true });
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folderName}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download batch:", err);
      setError("Failed to download batch as ZIP");
    } finally {
      setDownloadingBatch(false);
    }
  }, [selectedBatch, items, batches, generateQRDataUrl]);

  // Load all batches
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await batchApi.getAll();
        setBatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load batches");
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  // Load items when batch is selected
  useEffect(() => {
    if (!selectedBatch) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      setLoadingItems(true);
      try {
        const data = await qrItemApi.getByBatchId(selectedBatch);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load items");
      } finally {
        setLoadingItems(false);
      }
    };
    loadItems();
  }, [selectedBatch]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">QR Code History</h1>
        <Link to="/">
          <Button>Create New</Button>
        </Link>
      </div>

      {batches.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-base-content/70 mb-4">
              No QR codes generated yet.
            </p>
            <Link to="/">
              <Button>Generate Your First QR Code</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Batch List */}
          <div className="md:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Batches</h2>
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                {batches.map((batch) => (
                  <li key={batch.id}>
                    <button
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedBatch === batch.id
                          ? "bg-primary text-primary-content"
                          : "bg-base-300 hover:bg-base-200"
                      }`}
                      onClick={() => setSelectedBatch(batch.id)}
                    >
                      <p className="font-medium truncate">{batch.title}</p>
                      <p className="text-sm opacity-70">
                        {batch.total_qr} QR codes • {batch.source}
                      </p>
                      <p className="text-xs opacity-50">
                        {new Date(batch.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Items List */}
          <div className="md:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedBatch ? "QR Items" : "Select a batch"}
                </h2>
                {selectedBatch && items.length > 0 && (
                  <Button
                    onClick={handleDownloadBatchAsZip}
                    loading={downloadingBatch}
                    size="sm"
                  >
                    📦 Download All (ZIP)
                  </Button>
                )}
              </div>

              {loadingItems ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : selectedBatch && items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Short Code</th>
                        <th>Original URL</th>
                        <th>Scans</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <code className="bg-base-300 px-2 py-1 rounded text-sm">
                              {item.short_code}
                            </code>
                          </td>
                          <td className="max-w-xs">
                            <a
                              href={item.original_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary truncate block"
                              title={item.original_url}
                            >
                              {item.original_url}
                            </a>
                          </td>
                          <td>
                            <span className="badge badge-info">
                              {item.scan_count}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                item.is_active ? "badge-success" : "badge-error"
                              }`}
                            >
                              {item.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleViewQR(item)}
                                title="View QR Code"
                              >
                                👁️
                              </button>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleDownloadQR(item)}
                                title="Download QR Code"
                              >
                                ⬇️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedBatch ? (
                <p className="text-base-content/70 py-4">
                  No items in this batch.
                </p>
              ) : (
                <p className="text-base-content/70 py-4">
                  Click on a batch to view its QR codes.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      <Modal
        isOpen={previewItem !== null}
        onClose={handleClosePreview}
        title="QR Code Preview"
      >
        {previewItem && (
          <div className="flex flex-col items-center py-4">
            {generatingQR ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : previewDataUrl ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img
                    src={previewDataUrl}
                    alt={`QR Code for ${previewItem.original_url}`}
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center space-y-2 w-full mt-6">
                  <p className="text-sm font-medium">Short Code</p>
                  <code className="bg-base-300 px-3 py-1 rounded text-sm block">
                    {previewItem.short_code}
                  </code>
                  <p className="text-sm font-medium mt-4">Original URL</p>
                  <a
                    href={previewItem.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm break-all"
                  >
                    {previewItem.original_url}
                  </a>
                  <p className="text-sm font-medium mt-4">Redirect URL</p>
                  <code className="bg-base-300 px-3 py-1 rounded text-xs block break-all">
                    {env.APP_URL}/r/{previewItem.short_code}
                  </code>
                  <div className="flex gap-2 mt-4 justify-center">
                    <span className="badge badge-info">
                      {previewItem.scan_count} scans
                    </span>
                    <span
                      className={`badge ${
                        previewItem.is_active ? "badge-success" : "badge-error"
                      }`}
                    >
                      {previewItem.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-primary mt-6"
                  onClick={handleDownloadFromPreview}
                >
                  Download QR Code
                </button>
              </>
            ) : (
              <p className="text-error">Failed to generate QR code</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoryPage;
