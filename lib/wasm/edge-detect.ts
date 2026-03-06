import { processorWorker } from "@/lib/ffmpeg/processor-worker";

export const runEdgeDetection = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const frame = ctx.getImageData(0, 0, width, height);
  const processed = await processorWorker.edgeDetect(frame);
  ctx.putImageData(processed, 0, 0);
};
