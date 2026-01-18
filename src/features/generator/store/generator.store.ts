// QR Generator Zustand store - local state for generator feature
import { create } from "zustand";
import type { QRCodeGenerateOptions, QRItem } from "@/types";

interface GeneratorState {
  // Input URLs
  urls: string[];
  // Batch metadata
  batchTitle: string;
  batchSource: "manual" | "csv";
  // QR generation options
  options: QRCodeGenerateOptions;
  // Generated QR items (after generation)
  generatedItems: (QRItem & { dataUrl: string })[];
  // Actions
  addUrl: (url: string) => void;
  addUrls: (urls: string[]) => void;
  removeUrl: (index: number) => void;
  clearUrls: () => void;
  setBatchTitle: (title: string) => void;
  setBatchSource: (source: "manual" | "csv") => void;
  setOptions: (options: Partial<QRCodeGenerateOptions>) => void;
  setGeneratedItems: (items: (QRItem & { dataUrl: string })[]) => void;
  reset: () => void;
}

const initialState = {
  urls: [],
  batchTitle: "",
  batchSource: "manual" as const,
  options: {
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  },
  generatedItems: [],
};

export const useGeneratorStore = create<GeneratorState>((set) => ({
  ...initialState,
  addUrl: (url) => set((state) => ({ urls: [...state.urls, url] })),
  addUrls: (urls) =>
    set((state) => ({
      urls: [...state.urls, ...urls],
      batchSource: "csv",
    })),
  removeUrl: (index) =>
    set((state) => ({ urls: state.urls.filter((_, i) => i !== index) })),
  clearUrls: () => set({ urls: [], generatedItems: [] }),
  setBatchTitle: (batchTitle) => set({ batchTitle }),
  setBatchSource: (batchSource) => set({ batchSource }),
  setOptions: (options) =>
    set((state) => ({ options: { ...state.options, ...options } })),
  setGeneratedItems: (generatedItems) => set({ generatedItems }),
  reset: () => set(initialState),
}));
