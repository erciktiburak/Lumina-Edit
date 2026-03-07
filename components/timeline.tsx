"use client";

import { useMemo, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEditorStore } from "@/lib/state/editor-store";
import { formatMs, timeToPixels } from "@/lib/utils/time";

export function Timeline() {
  const clips = useEditorStore((state) => state.clips);
  const tracks = useEditorStore((state) => state.tracks);
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);
  const reorderClips = useEditorStore((state) => state.reorderClips);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);

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
        <div className="relative min-w-[480px]" style={{ width: `${timeToPixels(totalMs + 1000, zoom)}px` }}>
          <div className="sticky left-0 top-0 z-20 flex text-[10px] text-muted">
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
          <div className="space-y-2 pt-2">
            {tracks.map((track) => (
              <div key={track.id} className="relative h-12 rounded-md border border-border/70 bg-black/5">
                <div className="absolute left-1 top-1 text-[10px] uppercase text-muted">{track.name}</div>
                {clips
                  .filter((clip) => clip.trackId === track.id)
                  .map((clip) => (
                    <div
                      key={clip.id}
                      className={`absolute top-4 h-7 rounded-md border px-2 py-1 text-[10px] transition-colors ${
                        dragTargetId === clip.id
                          ? "border-accent bg-accent/30"
                          : "border-accent bg-accent/15"
                      } ${dragSourceId === clip.id ? "cursor-grabbing opacity-70" : "cursor-grab"}`}
                      style={{ left: `${timeToPixels(clip.startMs, zoom)}px`, width: `${timeToPixels(clip.endMs - clip.startMs, zoom)}px` }}
                      title={`${formatMs(clip.startMs)} - ${formatMs(clip.endMs)}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        setDragSourceId(clip.id);
                      }}
                      onDragOver={(event) => {
                        if (!dragSourceId || dragSourceId === clip.id) return;
                        event.preventDefault();
                        setDragTargetId(clip.id);
                      }}
                      onDragLeave={() => {
                        if (dragTargetId === clip.id) {
                          setDragTargetId(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (!dragSourceId || dragSourceId === clip.id) return;
                        reorderClips(dragSourceId, clip.id);
                        setDragTargetId(null);
                      }}
                      onDragEnd={() => {
                        setDragSourceId(null);
                        setDragTargetId(null);
                      }}
                    >
                      {clip.id.slice(0, 8)}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
