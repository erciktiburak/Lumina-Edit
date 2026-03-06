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

export const fileToAsset = async (file: File): Promise<MediaAsset> => {
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");

  const id = crypto.randomUUID();
  const asset: MediaAsset = {
    id,
    name: file.name,
    kind: isVideo ? "video" : isAudio ? "audio" : "image",
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    createdAt: Date.now()
  };

  await db.assets.put(asset);
  await db.blobs.put({ id, blob: file, updatedAt: Date.now() });
  return asset;
};
