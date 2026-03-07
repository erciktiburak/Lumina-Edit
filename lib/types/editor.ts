export type AssetKind = "video" | "image" | "audio";

export type MediaAsset = {
  id: string;
  name: string;
  kind: AssetKind;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  fps?: number;
  durationMs?: number;
  bitrate?: number;
  createdAt: number;
};

export type Clip = {
  id: string;
  assetId: string;
  trackId: string;
  startMs: number;
  endMs: number;
  offsetMs: number;
  speed: number;
};

export type Track = {
  id: string;
  name: string;
  type: "video" | "audio";
};

export type FilterValues = {
  grayscale: number;
  sepia: number;
  brightness: number;
  contrast: number;
};

export type OverlayPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type OverlaySettings = {
  enabled: boolean;
  text: string;
  showWatermark: boolean;
  opacity: number;
  position: OverlayPosition;
};

export type ExportFormat = "mp4" | "webm" | "gif";

export type ExportPreset = {
  format: ExportFormat;
  quality: "draft" | "balanced" | "high";
  aspectRatio: "16:9" | "9:16" | "1:1";
};
