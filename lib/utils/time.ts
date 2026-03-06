export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const frameToMs = (frame: number, fps: number) => Math.round((frame / fps) * 1000);

export const formatMs = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds}`;
};

export const timeToPixels = (ms: number, zoom: number) => Math.max(2, (ms / 1000) * zoom);

export const pixelsToTime = (pixels: number, zoom: number) => Math.max(0, (pixels / zoom) * 1000);
