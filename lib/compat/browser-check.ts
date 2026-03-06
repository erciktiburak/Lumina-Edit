export type BrowserCapability = {
  ffmpegWasmReady: boolean;
  webWorkerReady: boolean;
  indexedDbReady: boolean;
  webGpuReady: boolean;
  crossOriginIsolated: boolean;
};

export const detectCapabilities = (): BrowserCapability => {
  if (typeof window === "undefined") {
    return {
      ffmpegWasmReady: false,
      webWorkerReady: false,
      indexedDbReady: false,
      webGpuReady: false,
      crossOriginIsolated: false
    };
  }

  return {
    ffmpegWasmReady: typeof WebAssembly !== "undefined",
    webWorkerReady: typeof Worker !== "undefined",
    indexedDbReady: typeof indexedDB !== "undefined",
    webGpuReady: typeof navigator !== "undefined" && "gpu" in navigator,
    crossOriginIsolated: window.crossOriginIsolated
  };
};
