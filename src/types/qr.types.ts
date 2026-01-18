// Shared TypeScript types

// Matches public.qr_batches table
export interface QRBatch {
  id: string;
  title: string;
  source: "manual" | "csv";
  total_qr: number;
  created_at: string;
}

// Matches public.qr_items table
export interface QRItem {
  id: string;
  batch_id: string;
  original_url: string;
  qr_code_url: string;
  short_code: string;
  scan_count: number;
  is_active: boolean;
  created_at: string;
}

// Matches public.qr_scans table
export interface QRScan {
  id: string;
  qr_item_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// QR Item with batch info (joined)
export interface QRItemWithBatch extends QRItem {
  qr_batches: QRBatch;
}

// Create DTOs
export interface CreateBatchDTO {
  title: string;
  source: "manual" | "csv";
}

export interface CreateQRItemDTO {
  batch_id: string;
  original_url: string;
  qr_code_url: string;
  short_code: string;
}

export interface CreateQRScanDTO {
  qr_item_id: string;
  ip_address?: string;
  user_agent?: string;
}

// QR Code generation options
export interface QRCodeGenerateOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
