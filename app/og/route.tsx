import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(140deg, #15181d 0%, #1d2128 55%, #254977 100%)",
          color: "#efeee9",
          padding: 64
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 5 }}>LUMINA-EDIT</div>
        <div style={{ fontSize: 78, fontWeight: 700, maxWidth: 960, lineHeight: 1.03 }}>
          Browser-native video engine with zero cloud upload
        </div>
        <div style={{ fontSize: 34, opacity: 0.8 }}>Next.js + FFmpeg.wasm + Web APIs</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
