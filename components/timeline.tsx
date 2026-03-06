"use client";

import { useMemo } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEditorStore } from "@/lib/state/editor-store";
import { formatMs, timeToPixels } from "@/lib/utils/time";

export function Timeline() {
  const clips = useEditorStore((state) => state.clips);
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);

  const totalMs = useMemo(() => clips.reduce((max, clip) => Math.max(max, clip.endMs), 0), [clips]);
  const tickMs = 1000;
  const rulerTicks = Math.max(1, Math.ceil((totalMs + 1000) / tickMs));

  return (
    <section className="panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg">Timeline</h3>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-border p-2"
            onClick={() => setZoom(Math.max(20, zoom - 20))}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-16 text-center font-mono text-xs text-muted">{zoom}px/s</span>
          <button
            className="rounded-lg border border-border p-2"
            onClick={() => setZoom(Math.min(260, zoom + 20))}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={20}
            max={260}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="Timeline zoom"
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border p-3">
        <div className="relative h-20 min-w-[480px]" style={{ width: `${timeToPixels(totalMs + 1000, zoom)}px` }}>
          <div className="absolute inset-x-0 top-0 flex text-[10px] text-muted">
            {Array.from({ length: rulerTicks }).map((_, index) => (
              <div
                key={`tick-${index}`}
                className="relative border-l border-border/60 pl-1"
                style={{ width: `${timeToPixels(tickMs, zoom)}px` }}
              >
                {Math.floor(index)}s
              </div>
            ))}
          </div>
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="absolute top-6 h-10 rounded-md border border-accent bg-accent/15 px-2 py-1 text-xs"
              style={{ left: `${timeToPixels(clip.startMs, zoom)}px`, width: `${timeToPixels(clip.endMs - clip.startMs, zoom)}px` }}
              title={`${formatMs(clip.startMs)} - ${formatMs(clip.endMs)}`}
            >
              {clip.id.slice(0, 8)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
