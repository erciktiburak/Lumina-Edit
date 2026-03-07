"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/lib/state/editor-store";
import { seekByFrame } from "@/lib/core/frame-seeker";
import { formatMs } from "@/lib/utils/time";
import type { OverlayPosition } from "@/lib/types/editor";

type VideoPlayerProps = {
  file: File | null;
};

const toCssFilter = (filters: { grayscale: number; sepia: number; brightness: number; contrast: number }) =>
  `grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%)`;

const overlayPositionClass: Record<OverlayPosition, string> = {
  "top-left": "left-4 top-4",
  "top-right": "right-4 top-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4"
};

const resolveOverlayAnchor = (position: OverlayPosition, width: number, height: number, textWidth: number, textHeight: number) => {
  const margin = Math.max(14, Math.round(Math.min(width, height) * 0.035));

  if (position === "top-left") return { x: margin, y: margin + textHeight };
  if (position === "top-right") return { x: Math.max(margin, width - textWidth - margin), y: margin + textHeight };
  if (position === "bottom-left") return { x: margin, y: Math.max(textHeight + margin, height - margin) };
  return { x: Math.max(margin, width - textWidth - margin), y: Math.max(textHeight + margin, height - margin) };
};

export function VideoPlayer({ file }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorMs = useEditorStore((state) => state.cursorMs);
  const setCursor = useEditorStore((state) => state.setCursor);
  const filters = useEditorStore((state) => state.filters);
  const overlay = useEditorStore((state) => state.overlay);
  const [durationMs, setDurationMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || Number.isNaN(video.duration)) return;
    const target = cursorMs / 1000;
    if (Math.abs(video.currentTime - target) > 0.04) {
      video.currentTime = target;
    }
  }, [cursorMs]);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = Math.max(1, video.videoWidth || 320);
          canvas.height = Math.max(1, video.videoHeight || 180);
          ctx.filter = toCssFilter(filters);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (overlay.enabled) {
            const fontSize = Math.max(14, Math.round(canvas.width * 0.035));
            const text = overlay.text.trim() || "Lumina Edit";
            ctx.filter = "none";
            ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
            ctx.globalAlpha = overlay.opacity / 100;
            ctx.fillStyle = "#ffffff";

            const textMetrics = ctx.measureText(text);
            const textWidth = Math.ceil(textMetrics.width);
            const textHeight = Math.ceil(fontSize * 1.1);
            const anchor = resolveOverlayAnchor(overlay.position, canvas.width, canvas.height, textWidth, textHeight);

            if (overlay.showWatermark) {
              const badgeText = "LUMINA";
              const badgePaddingX = 10;
              const badgePaddingY = 6;
              ctx.font = `${Math.max(10, Math.round(fontSize * 0.5))}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
              const badgeWidth = Math.ceil(ctx.measureText(badgeText).width + badgePaddingX * 2);
              const badgeHeight = Math.ceil(fontSize * 0.7 + badgePaddingY * 2);
              const badgeX = anchor.x;
              const badgeY = anchor.y - textHeight - badgeHeight - 8;
              ctx.fillStyle = "rgba(8, 12, 20, 0.62)";
              ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
              ctx.fillStyle = "#e9efff";
              ctx.fillText(badgeText, badgeX + badgePaddingX, badgeY + badgeHeight - badgePaddingY);
            }

            ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
            ctx.fillStyle = "#ffffff";
            ctx.fillText(text, anchor.x, anchor.y);
            ctx.globalAlpha = 1;
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [filters, overlay]);

  if (!file || !objectUrl) {
    return <div className="panel rounded-2xl p-6 text-sm text-muted">No media selected yet.</div>;
  }

  return (
    <div className="panel rounded-2xl p-3">
      <div className="relative">
        <video
          ref={videoRef}
          src={objectUrl}
          className="max-h-[440px] w-full rounded-xl bg-black"
          style={{ filter: toCssFilter(filters) }}
          onLoadedMetadata={(event) => setDurationMs(Math.round(event.currentTarget.duration * 1000))}
          onTimeUpdate={(event) => setCursor(event.currentTarget.currentTime * 1000)}
        />
        {overlay.enabled && (
          <div
            className={`pointer-events-none absolute ${overlayPositionClass[overlay.position]}`}
            style={{ opacity: overlay.opacity / 100 }}
          >
            {overlay.showWatermark && (
              <div className="mb-1 inline-block rounded border border-white/20 bg-black/45 px-2 py-1 font-mono text-[10px] tracking-[0.16em] text-white">
                LUMINA
              </div>
            )}
            <div className="font-mono text-xs text-white md:text-sm">{overlay.text.trim() || "Lumina Edit"}</div>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-2 rounded-xl border border-border p-2">
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-border px-2 py-1 text-xs"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              if (video.paused) {
                void video.play();
                setIsPlaying(true);
              } else {
                video.pause();
                setIsPlaying(false);
              }
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(durationMs, 1)}
            value={Math.min(cursorMs, Math.max(durationMs, 1))}
            className="w-full"
            onChange={(event) => setCursor(Number(event.target.value))}
          />
          <div className="w-24 text-right font-mono text-xs text-muted">{formatMs(cursorMs)}</div>
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button
          className="rounded-md border border-border px-2 py-1 text-xs"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            const targetMs = seekByFrame({
              currentMs: cursorMs,
              fps: 30,
              direction: -1,
              durationMs
            });
            setCursor(targetMs);
          }}
        >
          Prev Frame
        </button>
        <button
          className="rounded-md border border-border px-2 py-1 text-xs"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            const targetMs = seekByFrame({
              currentMs: cursorMs,
              fps: 30,
              direction: 1,
              durationMs
            });
            setCursor(targetMs);
          }}
        >
          Next Frame
        </button>
      </div>
      <div className="mt-2">
        <p className="mb-1 text-xs text-muted">Canvas filter preview</p>
        <canvas ref={canvasRef} className="w-full rounded-xl border border-border bg-black" />
      </div>
    </div>
  );
}
