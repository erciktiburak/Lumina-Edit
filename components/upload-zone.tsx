"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { fileToAsset } from "@/lib/storage/db";
import { useEditorStore } from "@/lib/state/editor-store";

type UploadZoneProps = {
  onFileReady: (file: File) => void;
};

export function UploadZone({ onFileReady }: UploadZoneProps) {
  const addAsset = useEditorStore((state) => state.addAsset);
  const [isDragging, setIsDragging] = useState(false);

  const ingestFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      const asset = await fileToAsset(file);
      addAsset(asset);
      onFileReady(file);
    },
    [addAsset, onFileReady]
  );

  return (
    <label
      className={`panel block rounded-2xl border-dashed p-8 text-center transition ${
        isDragging ? "scale-[1.01] border-accent" : "border-border"
      }`}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void ingestFiles(event.dataTransfer.files);
      }}
      onDragOver={(event) => event.preventDefault()}
    >
      <input
        type="file"
        className="hidden"
        accept="video/*,image/*,audio/*"
        onChange={(event) => void ingestFiles(event.target.files)}
      />
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <Upload className="h-8 w-8 text-accent" />
        <h2 className="font-display text-xl">Drop media into the browser</h2>
        <p className="text-sm text-muted">No upload. No cloud sync. Everything stays on your machine.</p>
      </div>
    </label>
  );
}
