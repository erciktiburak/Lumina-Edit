type WorkerMessage =
  | { type: "PONG"; payload: { ts: number } }
  | { type: "EDGE_RESULT"; payload: ArrayBuffer };

class ProcessorWorkerClient {
  private worker: Worker | null = null;

  init() {
    if (typeof window === "undefined" || this.worker) return;
    this.worker = new Worker("/workers/processor.worker.js");
  }

  ping() {
    this.init();
    return new Promise<number>((resolve, reject) => {
      if (!this.worker) return reject(new Error("Worker unavailable"));
      const timer = setTimeout(() => reject(new Error("Worker timeout")), 3000);

      const handle = (event: MessageEvent<WorkerMessage>) => {
        if (event.data.type !== "PONG") return;
        clearTimeout(timer);
        this.worker?.removeEventListener("message", handle);
        resolve(event.data.payload.ts);
      };

      this.worker.addEventListener("message", handle);
      this.worker.postMessage({ type: "PING" });
    });
  }

  edgeDetect(image: ImageData) {
    this.init();
    return new Promise<ImageData>((resolve, reject) => {
      if (!this.worker) return reject(new Error("Worker unavailable"));

      const timeout = setTimeout(() => reject(new Error("Worker timeout")), 6000);
      const handle = (event: MessageEvent<WorkerMessage>) => {
        if (event.data.type !== "EDGE_RESULT") return;
        clearTimeout(timeout);
        this.worker?.removeEventListener("message", handle);

        const pixels = new Uint8ClampedArray(event.data.payload);
        resolve(new ImageData(pixels, image.width, image.height));
      };

      this.worker.addEventListener("message", handle);
      this.worker.postMessage(
        {
          type: "EDGE_DETECT",
          payload: { width: image.width, height: image.height, pixels: image.data.buffer }
        },
        [image.data.buffer]
      );
    });
  }
}

export const processorWorker = new ProcessorWorkerClient();
