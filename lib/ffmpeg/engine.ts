import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { OverlayPosition, OverlaySettings, TransitionSettings } from "@/lib/types/editor";

type BatchTrimItem = {
  id: string;
  file: File;
  startMs: number;
  endMs: number;
  speed?: number;
  overlay?: OverlaySettings;
  transitions?: TransitionSettings;
  fileName: string;
};

type BatchTrimResult = {
  id: string;
  fileName: string;
  blob: Blob;
};

const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

const canUseThreadedCore = () =>
  typeof window !== "undefined" && window.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined";

type EngineStatus = "idle" | "loading" | "ready" | "error";

class FfmpegEngine {
  private ffmpeg: FFmpeg | null = null;
  private status: EngineStatus = "idle";
  private initPromise: Promise<void> | null = null;
  private listeners = new Set<(line: string) => void>();

  getStatus() {
    return this.status;
  }

  onLog(listener: (line: string) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(line: string) {
    this.listeners.forEach((listener) => listener(line));
  }

  private escapeDrawText(text: string) {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/:/g, "\\:")
      .replace(/'/g, "\\\\'")
      .replace(/,/g, "\\,")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]");
  }

  private getOverlayCoord(position: OverlayPosition, axis: "x" | "y", token: "text" | "badge") {
    const margin = "24";

    if (axis === "x") {
      if (position.endsWith("left")) return margin;
      if (token === "text") return `w-tw-${margin}`;
      return `w-200-${margin}`;
    }

    if (position.startsWith("top")) {
      if (token === "text") return `${margin}+th`;
      return margin;
    }

    if (token === "text") return `h-th-${margin}`;
    return `h-52-${margin}`;
  }

  private buildOverlayFilter(overlay: OverlaySettings) {
    if (!overlay.enabled) return [] as string[];

    const opacity = Math.max(0.2, Math.min(1, overlay.opacity / 100)).toFixed(2);
    const text = this.escapeDrawText(overlay.text.trim() || "Lumina Edit");
    const textX = this.getOverlayCoord(overlay.position, "x", "text");
    const textY = this.getOverlayCoord(overlay.position, "y", "text");
    const filters = [
      `drawtext=text='${text}':fontsize=30:fontcolor=white@${opacity}:x=${textX}:y=${textY}`
    ];

    if (overlay.showWatermark) {
      const badgeX = this.getOverlayCoord(overlay.position, "x", "badge");
      const badgeY = this.getOverlayCoord(overlay.position, "y", "badge");
      filters.unshift(`drawbox=x=${badgeX}:y=${badgeY}:w=200:h=52:color=black@${Math.max(0.2, Number(opacity) - 0.2).toFixed(2)}:t=fill`);
      filters.push(`drawtext=text='LUMINA':fontsize=18:fontcolor=white@${opacity}:x=${badgeX}+20:y=${badgeY}+33`);
    }

    return filters;
  }

  private buildTransitionFilter(transitions: TransitionSettings, clipDurationSec: number) {
    if (!transitions.enabled || clipDurationSec <= 0) return [] as string[];

    const fadeInSec = Math.max(0, transitions.fadeInMs / 1000);
    const fadeOutSec = Math.max(0, transitions.fadeOutMs / 1000);
    const maxWindow = clipDurationSec - 0.05;
    const inDuration = Math.min(fadeInSec, maxWindow);
    const outDuration = Math.min(fadeOutSec, maxWindow);
    const outStart = Math.max(0, clipDurationSec - outDuration);

    const filters: string[] = [];
    if (inDuration > 0) {
      filters.push(`fade=t=in:st=0:d=${inDuration.toFixed(3)}`);
    }
    if (outDuration > 0) {
      filters.push(`fade=t=out:st=${outStart.toFixed(3)}:d=${outDuration.toFixed(3)}`);
    }
    return filters;
  }

  private buildAudioTempoFilter(speed: number) {
    const clamped = Math.max(0.5, Math.min(2, speed));
    if (Math.abs(clamped - 1) < 0.001) return "";
    return `atempo=${clamped.toFixed(3)}`;
  }

  async init() {
    if (this.ffmpeg) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.boot();
    await this.initPromise;
    this.initPromise = null;
  }

  private async boot() {
    this.status = "loading";
    try {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => this.emit(message));

      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
      const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript");

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL
      });

      if (!canUseThreadedCore()) {
        this.emit("Threaded FFmpeg disabled (SharedArrayBuffer or COI unavailable).");
      }

      this.ffmpeg = ffmpeg;
      this.status = "ready";
    } catch (error) {
      this.status = "error";
      this.emit(error instanceof Error ? error.message : "FFmpeg failed to initialize");
      this.initPromise = null;
      throw error;
    }
  }

  async extractMetadata(file: File) {
    if (!this.ffmpeg) await this.init();
    const ffmpeg = this.ffmpeg;
    if (!ffmpeg) throw new Error("FFmpeg unavailable");

    const inFile = `input-${crypto.randomUUID()}`;
    await ffmpeg.writeFile(inFile, await fetchFile(file));
    await ffmpeg.exec(["-i", inFile, "-f", "null", "-"]);
    await ffmpeg.deleteFile(inFile);
  }

  async trim(file: File, startMs: number, endMs: number, overlay?: OverlaySettings, transitions?: TransitionSettings, speed = 1) {
    if (!this.ffmpeg) await this.init();
    const ffmpeg = this.ffmpeg;
    if (!ffmpeg) throw new Error("FFmpeg unavailable");

    const inputName = `in-${crypto.randomUUID()}.mp4`;
    const outputName = `out-${crypto.randomUUID()}.mp4`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));
    const baseArgs = [
      "-ss",
      (startMs / 1000).toFixed(3),
      "-to",
      (endMs / 1000).toFixed(3),
      "-i",
      inputName
    ];

    const clipDurationSec = Math.max(0, (endMs - startMs) / 1000);
    const filterChain = [
      ...(overlay ? this.buildOverlayFilter(overlay) : []),
      ...(transitions ? this.buildTransitionFilter(transitions, clipDurationSec) : [])
    ];
    const clampedSpeed = Math.max(0.5, Math.min(2, speed));
    if (Math.abs(clampedSpeed - 1) >= 0.001) {
      filterChain.push(`setpts=${(1 / clampedSpeed).toFixed(5)}*PTS`);
    }
    const audioTempo = this.buildAudioTempoFilter(clampedSpeed);

    const hasFilters = filterChain.length > 0 || Boolean(audioTempo);
    const command = hasFilters
      ? [
          ...baseArgs,
          ...(filterChain.length > 0 ? ["-vf", filterChain.join(",")] : []),
          ...(audioTempo ? ["-af", audioTempo] : []),
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "23",
          "-c:a",
          audioTempo ? "aac" : "copy",
          outputName
        ]
      : [...baseArgs, "-c", "copy", outputName];

    try {
      await ffmpeg.exec(command);
    } catch (error) {
      if (!hasFilters) throw error;
      this.emit("Filtered render failed, retrying export without filters.");
      await ffmpeg.exec([...baseArgs, "-c", "copy", outputName]);
    }

    const data = await ffmpeg.readFile(outputName);
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    if (typeof data === "string") {
      throw new Error("Unexpected string output from ffmpeg");
    }

    const bytes = Uint8Array.from(data);
    return new Blob([bytes.buffer], { type: "video/mp4" });
  }

  async batchTrim(items: BatchTrimItem[]): Promise<BatchTrimResult[]> {
    const outputs: BatchTrimResult[] = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      this.emit(`Batch export ${index + 1}/${items.length}: ${item.fileName}`);
      const blob = await this.trim(item.file, item.startMs, item.endMs, item.overlay, item.transitions, item.speed ?? 1);
      outputs.push({
        id: item.id,
        fileName: item.fileName,
        blob
      });
    }

    this.emit(`Batch export finished: ${outputs.length} clips rendered.`);
    return outputs;
  }
}

export const ffmpegEngine = new FfmpegEngine();
