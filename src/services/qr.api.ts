// QR Code API service - handles Supabase operations
import { supabase } from "@/lib";
import type {
  QRBatch,
  QRItem,
  QRScan,
  CreateBatchDTO,
  CreateQRItemDTO,
  CreateQRScanDTO,
} from "@/types";

// ============ BATCH OPERATIONS ============

export const batchApi = {
  async getAll(): Promise<QRBatch[]> {
    const { data, error } = await supabase
      .from("qr_batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<QRBatch | null> {
    const { data, error } = await supabase
      .from("qr_batches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  },

  async create(batch: CreateBatchDTO): Promise<QRBatch> {
    const { data, error } = await supabase
      .from("qr_batches")
      .insert(batch)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTotalQR(id: string, total_qr: number): Promise<void> {
    const { error } = await supabase
      .from("qr_batches")
      .update({ total_qr })
      .eq("id", id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("qr_batches").delete().eq("id", id);

    if (error) throw error;
  },
};

// ============ QR ITEM OPERATIONS ============

export const qrItemApi = {
  async getByBatchId(batchId: string): Promise<QRItem[]> {
    const { data, error } = await supabase
      .from("qr_items")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async getByShortCode(shortCode: string): Promise<QRItem | null> {
    const { data, error } = await supabase
      .from("qr_items")
      .select("*")
      .eq("short_code", shortCode)
      .eq("is_active", true)
      .single();

    if (error) return null;
    return data;
  },

  async create(item: CreateQRItemDTO): Promise<QRItem> {
    const { data, error } = await supabase
      .from("qr_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createMany(items: CreateQRItemDTO[]): Promise<QRItem[]> {
    const { data, error } = await supabase
      .from("qr_items")
      .insert(items)
      .select();

    if (error) throw error;
    return data ?? [];
  },

  async toggleActive(id: string, is_active: boolean): Promise<void> {
    const { error } = await supabase
      .from("qr_items")
      .update({ is_active })
      .eq("id", id);

    if (error) throw error;
  },

  async incrementScanCount(id: string): Promise<void> {
    const { error } = await supabase.rpc("increment_scan_count", {
      item_id: id,
    });

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("qr_items").delete().eq("id", id);

    if (error) throw error;
  },
};

// ============ QR SCAN OPERATIONS ============

export const qrScanApi = {
  async create(scan: CreateQRScanDTO): Promise<QRScan> {
    const { data, error } = await supabase
      .from("qr_scans")
      .insert(scan)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByItemId(itemId: string): Promise<QRScan[]> {
    const { data, error } = await supabase
      .from("qr_scans")
      .select("*")
      .eq("qr_item_id", itemId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async getCountByItemId(itemId: string): Promise<number> {
    const { count, error } = await supabase
      .from("qr_scans")
      .select("*", { count: "exact", head: true })
      .eq("qr_item_id", itemId);

    if (error) throw error;
    return count ?? 0;
  },
};

// Legacy export for backward compatibility
export const qrApi = {
  ...batchApi,
  ...qrItemApi,
  ...qrScanApi,
};
