import { describe, expect, it } from "vitest";
import { clamp, frameToMs, msToFrame, pixelsToTime, timeToPixels } from "@/lib/utils/time";

describe("time conversion utilities", () => {
  it("converts milliseconds to frame and back", () => {
    const frame = msToFrame(5000, 30);
    expect(frame).toBe(150);
    expect(frameToMs(frame, 30)).toBe(5000);
  });

  it("maps timeline pixels to milliseconds", () => {
    expect(timeToPixels(3000, 80)).toBe(240);
    expect(pixelsToTime(240, 80)).toBe(3000);
  });

  it("rounds frame conversion consistently", () => {
    expect(msToFrame(333, 30)).toBe(10);
    expect(frameToMs(10, 30)).toBe(333);
  });

  it("clamps ranges for timeline guards", () => {
    expect(clamp(200, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(40, 0, 100)).toBe(40);
  });
});
