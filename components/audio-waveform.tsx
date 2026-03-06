"use client";

import { useEffect, useRef } from "react";

type AudioWaveformProps = {
  file: File | null;
};

export function AudioWaveform({ file }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("audio/") && !file.type.startsWith("video/")) return;

    const draw = async () => {
      const ctx = canvasRef.current?.getContext("2d");
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      const audioCtx = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      const data = audioBuffer.getChannelData(0);

      canvas.width = 800;
      canvas.height = 120;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 95, 204, 0.25)";
      ctx.strokeStyle = "#005fcc";

      const step = Math.ceil(data.length / canvas.width);
      for (let x = 0; x < canvas.width; x += 1) {
        const start = x * step;
        const slice = data.subarray(start, start + step);
        let peak = 0;
        for (let i = 0; i < slice.length; i += 1) peak = Math.max(peak, Math.abs(slice[i] ?? 0));

        const h = Math.max(1, peak * canvas.height);
        const y = (canvas.height - h) / 2;
        ctx.fillRect(x, y, 1, h);
      }

      await audioCtx.close();
    };

    void draw();
  }, [file]);

  return (
    <section className="panel rounded-2xl p-4">
      <h3 className="mb-2 font-display text-lg">Waveform</h3>
      <canvas ref={canvasRef} className="h-24 w-full rounded-lg border border-border bg-white/50" />
    </section>
  );
}
