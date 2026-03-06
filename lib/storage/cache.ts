import { db } from "@/lib/storage/db";

export const cache = {
  async getBlob(assetId: string) {
    const record = await db.blobs.get(assetId);
    return record?.blob ?? null;
  },

  async deleteAsset(assetId: string) {
    await db.transaction("rw", db.assets, db.blobs, async () => {
      await db.assets.delete(assetId);
      await db.blobs.delete(assetId);
    });
  },

  async assetUsage() {
    const blobs = await db.blobs.toArray();
    return blobs.reduce((total, entry) => total + entry.blob.size, 0);
  }
};
