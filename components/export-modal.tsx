"use client";

import { useMemo, useState } from "react";
import { ffmpegEngine } from "@/lib/ffmpeg/engine";
import { metrics } from "@/lib/analytics/local-metrics";
import { useEditorStore } from "@/lib/state/editor-store";

type ExportModalProps = {
  file: File | null;
};

export function ExportModal({ file }: ExportModalProps) {
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

  const disabled = useMemo(() => !file || isProcessing, [file, isProcessing]);

  const handleExport = async () => {
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    try {
      const safeStart = Math.max(0, Math.min(trimStartMs, trimEndMs - 250));
      const safeEnd = Math.max(safeStart + 250, trimEndMs);
      const output = await ffmpegEngine.trim(file, safeStart, safeEnd, overlay, transitions, playback.speed);
      const a = document.createElement("a");
      const url = URL.createObjectURL(output);
      a.href = url;
      a.download = `lumina-export-${quality}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
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
              <label className="flex flex-col gap-1">
                Trim Start (ms)
                <input
                  type="number"
                  min={0}
                  value={trimStartMs}
                  onChange={(e) => setTrimStartMs(Number(e.target.value))}
                  className="rounded-md border border-border bg-transparent p-2"
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
