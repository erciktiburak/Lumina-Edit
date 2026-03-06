import { clamp, frameToMs, msToFrame } from "@/lib/utils/time";

export const seekByFrame = ({
  currentMs,
  fps,
  direction,
  durationMs
}: {
  currentMs: number;
  fps: number;
  direction: -1 | 1;
  durationMs: number;
}) => {
  const currentFrame = msToFrame(currentMs, fps);
  const nextFrame = Math.max(0, currentFrame + direction);
  const targetMs = frameToMs(nextFrame, fps);
  return clamp(targetMs, 0, durationMs);
};
