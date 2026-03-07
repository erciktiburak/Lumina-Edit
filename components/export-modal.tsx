"use client";

import { useMemo, useState } from "react";
import { ffmpegEngine } from "@/lib/ffmpeg/engine";
import { metrics } from "@/lib/analytics/local-metrics";
import { cache } from "@/lib/storage/cache";
import { useEditorStore } from "@/lib/state/editor-store";

type ExportModalProps = {
  file: File | null;
};

export function ExportModal({ file }: ExportModalProps) {
  const assets = useEditorStore((state) => state.assets);
  const clips = useEditorStore((state) => state.clips);
  const overlay = useEditorStore((state) => state.overlay);
  const transitions = useEditorStore((state) => state.transitions);
  const playback = useEditorStore((state) => state.playback);
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState("balanced");
  const [format, setFormat] = useState("mp4");
  const [trimStartMs, setTrimStartMs] = useState(0);
  const [trimEndMs, setTrimEndMs] = useState(5000);
  const [batchMode, setBatchMode] = useState(false);

  const batchClipCount = useMemo(() => clips.filter((clip) => clip.trackId.startsWith("video-track")).length, [clips]);
  const disabled = useMemo(() => {
    const hasBatchCandidate = batchClipCount > 0;
    const hasSingleCandidate = Boolean(file);
    return isProcessing || (!hasSingleCandidate && !hasBatchCandidate);
  }, [batchClipCount, file, isProcessing]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!file && !batchMode) return;

    setError(null);
    setIsProcessing(true);
    try {
      if (batchMode) {
        const batchItems = await Promise.all(
          clips
            .filter((clip) => clip.trackId.startsWith("video-track"))
            .map(async (clip, index) => {
              const asset = assets.find((entry) => entry.id === clip.assetId);
              if (!asset) return null;
              const blob = await cache.getBlob(clip.assetId);
              if (!blob) return null;
              const fileInput = new File([blob], asset.name || `asset-${clip.assetId}.mp4`, { type: asset.mimeType || "video/mp4" });
              return {
                id: clip.id,
                file: fileInput,
                startMs: clip.startMs,
                endMs: clip.endMs,
                speed: clip.speed > 0 ? clip.speed : playback.speed,
                overlay,
                transitions,
                fileName: `lumina-batch-${String(index + 1).padStart(2, "0")}-${asset.name.replace(/\.[^/.]+$/, "")}.mp4`
              };
            })
        );

        const validItems = batchItems.filter((item): item is NonNullable<typeof item> => item !== null);
        if (validItems.length === 0) {
          throw new Error("No cached video clips found for batch export.");
        }

        const rendered = await ffmpegEngine.batchTrim(validItems);
        rendered.forEach((entry) => downloadBlob(entry.blob, entry.fileName));
        metrics.incrementExport();
        setOpen(false);
        return;
      }

      const safeStart = Math.max(0, Math.min(trimStartMs, trimEndMs - 250));
      const safeEnd = Math.max(safeStart + 250, trimEndMs);
      if (!file) {
        throw new Error("No source file selected.");
      }
      const output = await ffmpegEngine.trim(file, safeStart, safeEnd, overlay, transitions, playback.speed);
      downloadBlob(output, `lumina-export-${quality}.${format}`);
      metrics.incrementExport();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50" disabled={disabled} onClick={() => setOpen(true)}>
        Export
      </button>

      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4">
          <div className="panel w-full max-w-md rounded-2xl p-5">
            <h3 className="font-display text-xl">Export clip</h3>
            <p className="mt-1 text-sm text-muted">Quick local export using FFmpeg.wasm.</p>

            <div className="mt-4 space-y-3 text-sm">
              <label className="flex flex-col gap-1">
                Format
                <select className="rounded-md border border-border bg-transparent p-2" value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="mp4">MP4</option>
                  <option value="webm">WEBM</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Quality
                <select className="rounded-md border border-border bg-transparent p-2" value={quality} onChange={(e) => setQuality(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="balanced">Balanced</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                <span>Batch export video clips</span>
                <input type="checkbox" checked={batchMode} onChange={(e) => setBatchMode(e.target.checked)} />
              </label>
              {batchMode && <p className="text-xs text-muted">{batchClipCount} clips will be rendered and downloaded sequentially.</p>}
              <label className="flex flex-col gap-1">
                Trim Start (ms)
                <input
                  type="number"
                  min={0}
                  value={trimStartMs}
                  onChange={(e) => setTrimStartMs(Number(e.target.value))}
                  className="rounded-md border border-border bg-transparent p-2"
                  disabled={batchMode}
                />
              </label>
              <label className="flex flex-col gap-1">
                Trim End (ms)
                <input
                  type="number"
                  min={0}
                  value={trimEndMs}
                  onChange={(e) => setTrimEndMs(Number(e.target.value))}
                  className="rounded-md border border-border bg-transparent p-2"
                  disabled={batchMode}
                />
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg border border-border px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="rounded-lg bg-accent px-3 py-2 text-sm text-white disabled:opacity-50" onClick={() => void handleExport()} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Start export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
