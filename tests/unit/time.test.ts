import { describe, expect, it } from "vitest";
import { frameToMs, msToFrame, pixelsToTime, timeToPixels } from "@/lib/utils/time";

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
});
