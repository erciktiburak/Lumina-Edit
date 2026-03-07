"use client";

import { create } from "zustand";
import { db } from "@/lib/storage/db";
import type { Clip, ExportPreset, FilterValues, MediaAsset, OverlaySettings, Track } from "@/lib/types/editor";

type EditorSnapshot = {
  assets: MediaAsset[];
  clips: Clip[];
  tracks: Track[];
  currentAssetId: string | null;
  cursorMs: number;
  zoom: number;
  filters: FilterValues;
  overlay: OverlaySettings;
};

type EditorState = EditorSnapshot & {
  logs: string[];
  exportPreset: ExportPreset;
  history: EditorSnapshot[];
  future: EditorSnapshot[];
  addAsset: (asset: MediaAsset) => void;
  addLog: (line: string) => void;
  clearLogs: () => void;
  setCursor: (cursorMs: number) => void;
  setZoom: (zoom: number) => void;
  setCurrentAsset: (id: string) => void;
  updateFilters: (values: Partial<FilterValues>) => void;
  updateOverlay: (values: Partial<OverlaySettings>) => void;
  addClip: (clip: Clip) => void;
  reorderClips: (sourceId: string, destinationId: string) => void;
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => Promise<void>;
  loadSnapshot: () => Promise<void>;
};

const baseSnapshot: EditorSnapshot = {
  assets: [],
  clips: [],
  tracks: [
    { id: "video-track-1", name: "Video Layer", type: "video" },
    { id: "audio-track-1", name: "Audio Layer", type: "audio" }
  ],
  currentAssetId: null,
  cursorMs: 0,
  zoom: 80,
  filters: {
    grayscale: 0,
    sepia: 0,
    brightness: 100,
    contrast: 100
  },
  overlay: {
    enabled: false,
    text: "Lumina Edit",
    showWatermark: true,
    opacity: 70,
    position: "top-right"
  }
};

const takeSnapshot = (state: EditorState): EditorSnapshot => ({
  assets: state.assets,
  clips: state.clips,
  tracks: state.tracks,
  currentAssetId: state.currentAssetId,
  cursorMs: state.cursorMs,
  zoom: state.zoom,
  filters: state.filters,
  overlay: state.overlay
});

export const useEditorStore = create<EditorState>((set, get) => ({
  ...baseSnapshot,
  logs: [],
  exportPreset: { format: "mp4", quality: "balanced", aspectRatio: "16:9" },
  history: [],
  future: [],

  addAsset: (asset) =>
    set((state) => ({
      ...state,
      assets: [...state.assets, asset],
      currentAssetId: state.currentAssetId ?? asset.id,
      history: [...state.history.slice(-30), takeSnapshot(state)],
      future: []
    })),

  addLog: (line) => set((state) => ({ ...state, logs: [...state.logs.slice(-150), line] })),

  clearLogs: () => set((state) => ({ ...state, logs: [] })),

  setCursor: (cursorMs) => set((state) => ({ ...state, cursorMs })),

  setZoom: (zoom) => set((state) => ({ ...state, zoom })),

  setCurrentAsset: (id) => set((state) => ({ ...state, currentAssetId: id })),

  updateFilters: (values) =>
    set((state) => ({
      ...state,
      filters: { ...state.filters, ...values }
    })),

  updateOverlay: (values) =>
    set((state) => ({
      ...state,
      overlay: { ...state.overlay, ...values }
    })),

  addClip: (clip) =>
    set((state) => ({
      ...state,
      clips: [...state.clips, clip],
      history: [...state.history.slice(-30), takeSnapshot(state)],
      future: []
    })),

  reorderClips: (sourceId, destinationId) =>
    set((state) => {
      const clips = [...state.clips];
      const sourceIndex = clips.findIndex((clip) => clip.id === sourceId);
      const destinationIndex = clips.findIndex((clip) => clip.id === destinationId);
      if (sourceIndex < 0 || destinationIndex < 0) return state;
      const [moved] = clips.splice(sourceIndex, 1);
      clips.splice(destinationIndex, 0, moved);
      return {
        ...state,
        clips,
        history: [...state.history.slice(-30), takeSnapshot(state)],
        future: []
      };
    }),

  undo: () =>
    set((state) => {
      const prev = state.history[state.history.length - 1];
      if (!prev) return state;
      return {
        ...state,
        ...prev,
        history: state.history.slice(0, -1),
        future: [takeSnapshot(state), ...state.future]
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        ...next,
        history: [...state.history, takeSnapshot(state)],
        future: state.future.slice(1)
      };
    }),

  saveSnapshot: async () => {
    const state = get();
    const payload = JSON.stringify(takeSnapshot(state));
    await db.snapshots.put({ id: "auto-save", json: payload, updatedAt: Date.now() });
  },

  loadSnapshot: async () => {
    const snapshot = await db.snapshots.get("auto-save");
    if (!snapshot) return;
    const parsed = JSON.parse(snapshot.json) as EditorSnapshot;
    set((state) => ({ ...state, ...parsed }));
  }
}));
