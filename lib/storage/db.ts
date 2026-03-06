import Dexie, { type Table } from "dexie";
import type { MediaAsset } from "@/lib/types/editor";

export type StoredBlob = {
  id: string;
  blob: Blob;
  updatedAt: number;
};

class LuminaDb extends Dexie {
  assets!: Table<MediaAsset, string>;
  blobs!: Table<StoredBlob, string>;
  snapshots!: Table<{ id: string; json: string; updatedAt: number }, string>;

  constructor() {
    super("lumina-edit");
    this.version(1).stores({
      assets: "id, name, kind, createdAt",
      blobs: "id, updatedAt",
      snapshots: "id, updatedAt"
    });
  }
}

export const db = new LuminaDb();

const extractMediaMetadata = async (file: File) => {
  if (typeof window === "undefined") return {};
  const url = URL.createObjectURL(file);

  try {
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Unable to parse video metadata"));
      });

      return {
        width: video.videoWidth,
        height: video.videoHeight,
        durationMs: Math.round(video.duration * 1000)
      };
    }

    if (file.type.startsWith("audio/")) {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.src = url;
      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => reject(new Error("Unable to parse audio metadata"));
      });

      return {
        durationMs: Math.round(audio.duration * 1000)
      };
    }

    return {};
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const fileToAsset = async (file: File): Promise<MediaAsset> => {
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");

  const id = crypto.randomUUID();
  const metadata = await extractMediaMetadata(file);

  const asset: MediaAsset = {
    id,
    name: file.name,
    kind: isVideo ? "video" : isAudio ? "audio" : "image",
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    ...metadata,
    createdAt: Date.now()
  };

  await db.assets.put(asset);
  await db.blobs.put({ id, blob: file, updatedAt: Date.now() });
  return asset;
};
