// QR Code preview grid component
import type { QRItem } from "@/types";

interface QRPreviewItem {
  url: string;
  dataUrl: string;
  shortCode?: string;
  item?: QRItem;
}

interface QRPreviewGridProps {
  items: QRPreviewItem[];
  onDownload: (dataUrl: string, url: string, item?: QRItem) => void;
}

export const QRPreviewGrid = ({ items, onDownload }: QRPreviewGridProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div
          key={item.shortCode || index}
          className="card bg-base-200 shadow-sm"
        >
          <figure className="p-4">
            <img src={item.dataUrl} alt={`QR Code for ${item.url}`} />
          </figure>
          <div className="card-body p-4 pt-0">
            <p className="text-xs truncate" title={item.url}>
              {item.url}
            </p>
            {item.shortCode && (
              <p className="text-xs text-base-content/50">
                Code: {item.shortCode}
              </p>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onDownload(item.dataUrl, item.url, item.item)}
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
