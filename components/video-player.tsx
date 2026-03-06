"use client";

import { useEffect, useMemo, useRef } from "react";
import { useEditorStore } from "@/lib/state/editor-store";
import { seekByFrame } from "@/lib/core/frame-seeker";

type VideoPlayerProps = {
  file: File | null;
};

const toCssFilter = (filters: { grayscale: number; sepia: number; brightness: number; contrast: number }) =>
  `grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%)`;

export function VideoPlayer({ file }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorMs = useEditorStore((state) => state.cursorMs);
  const setCursor = useEditorStore((state) => state.setCursor);
  const filters = useEditorStore((state) => state.filters);

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

  if (!file || !objectUrl) {
    return <div className="panel rounded-2xl p-6 text-sm text-muted">No media selected yet.</div>;
  }

  return (
    <div className="panel rounded-2xl p-3">
      <video
        ref={videoRef}
        src={objectUrl}
        controls
        className="max-h-[440px] w-full rounded-xl bg-black"
        style={{ filter: toCssFilter(filters) }}
        onTimeUpdate={(event) => setCursor(event.currentTarget.currentTime * 1000)}
      />
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
              durationMs: Math.round(video.duration * 1000)
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
              durationMs: Math.round(video.duration * 1000)
            });
            setCursor(targetMs);
          }}
        >
          Next Frame
        </button>
      </div>
    </div>
  );
}
