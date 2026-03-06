self.onmessage = async (event) => {
  const { type, payload } = event.data || {};

  if (type === "PING") {
    self.postMessage({ type: "PONG", payload: { ts: Date.now(), requestId: payload?.requestId } });
    return;
  }

  if (type === "EDGE_DETECT") {
    const { width, height, pixels } = payload;
    const src = new Uint8ClampedArray(pixels);
    const out = new Uint8ClampedArray(src.length);
    const stride = width * 4;

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = y * stride + x * 4;
        const gx =
          -src[i - stride - 4] - 2 * src[i - 4] - src[i + stride - 4] +
          src[i - stride + 4] + 2 * src[i + 4] + src[i + stride + 4];
        const gy =
          -src[i - stride - 4] - 2 * src[i - stride] - src[i - stride + 4] +
          src[i + stride - 4] + 2 * src[i + stride] + src[i + stride + 4];
        const value = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        out[i] = value;
        out[i + 1] = value;
        out[i + 2] = value;
        out[i + 3] = 255;
      }
    }

    self.postMessage({ type: "EDGE_RESULT", payload: { requestId: payload.requestId, pixels: out.buffer } }, [out.buffer]);
  }
};
