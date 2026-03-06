import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

const canUseThreadedCore = () =>
  typeof window !== "undefined" && window.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined";

type EngineStatus = "idle" | "loading" | "ready" | "error";

class FfmpegEngine {
  private ffmpeg: FFmpeg | null = null;
  private status: EngineStatus = "idle";
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

  async init() {
    if (this.ffmpeg || this.status === "loading") return;

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

  async trim(file: File, startMs: number, endMs: number) {
    if (!this.ffmpeg) await this.init();
    const ffmpeg = this.ffmpeg;
    if (!ffmpeg) throw new Error("FFmpeg unavailable");

    const inputName = `in-${crypto.randomUUID()}.mp4`;
    const outputName = `out-${crypto.randomUUID()}.mp4`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));
    await ffmpeg.exec([
      "-ss",
      (startMs / 1000).toFixed(3),
      "-to",
      (endMs / 1000).toFixed(3),
      "-i",
      inputName,
      "-c",
      "copy",
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    if (typeof data === "string") {
      throw new Error("Unexpected string output from ffmpeg");
    }

    const bytes = Uint8Array.from(data);
    return new Blob([bytes.buffer], { type: "video/mp4" });
  }
}

export const ffmpegEngine = new FfmpegEngine();
