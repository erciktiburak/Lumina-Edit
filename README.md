# Lumina-Edit

The open-source, privacy-first, browser-native video and image processing engine.

Lumina-Edit runs heavy media workflows in the browser using WebAssembly, Web Workers, canvas pipelines, and local persistence. No backend upload is required for core workflows.

## Vision

- Keep user media local by default.
- Treat the browser like an operating system runtime.
- Move expensive processing into WASM and workers.
- Deliver a timeline-first editing UX similar to desktop tools.

## Architecture

Detailed architecture notes: `docs/architecture.md`

### Runtime Layers

1. **UI Layer (Next.js App Router)**
   - Timeline, player, property controls, export modal, logs panel.
2. **State Layer (Zustand)**
   - Multi-track clips, filter controls, cursor, undo/redo history, auto-save.
3. **Processing Layer (FFmpeg.wasm + worker)**
   - Browser-side trim/export tasks, worker-based edge detection pipeline.
4. **Persistence Layer (IndexedDB / Dexie)**
   - Assets and blobs are cached in browser storage.
5. **Compatibility Layer**
   - Feature checks for WebAssembly, Worker, IndexedDB, WebGPU, COOP/COEP.

### Security model

- Cross-Origin Isolation headers are enabled in `next.config.ts`.
- Threaded FFmpeg relies on `SharedArrayBuffer` and auto-falls back when COI is unavailable.
- Media processing runs client-side.
- Local metrics stay in `localStorage`.
- No mandatory analytics or server processing.

## Feature Map

- Drag-and-drop media ingest with preview hooks.
- FFmpeg.wasm lazy initialization and log stream.
- Basic timeline + zoom + clip visualization.
- Drag-and-drop clip reordering on timeline tracks.
- Keyboard shortcuts (`Cmd/Ctrl+S`, `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`).
- Auto-save snapshots into IndexedDB.
- Overlay system (watermark + custom text + position + opacity).
- Transition controls for fade-in and fade-out.
- Speed manipulation controls (0.5x to 2.0x) for preview and export.
- Effect preset library with one-click real-time preview.
- Adaptive canvas preview tuned for smoother 4K playback.
- Local export modal and download.
- Tutorial overlay for first-time users.
- Local-only usage metrics panel.
- PWA manifest + service worker shell.
- Open Graph image route for sharing.

## Editing Workflow

1. Upload media and preview it instantly.
2. Arrange clips in the timeline and reorder with drag-and-drop.
3. Pick an effect preset (or tune filters manually).
4. Add overlay text/watermark, set fade transitions, and tune speed.
5. Export locally through FFmpeg.wasm without uploading source media.

## Progress Snapshot

- Current status: through roadmap step #27.
- Recent commits include overlays, transitions, preset library, 4K canvas optimization, and speed controls.
- The next focus is batch processing and undo/redo depth polishing.

## Browser-native limitations

- Very long 4K exports can hit memory limits depending on browser/device.
- SharedArrayBuffer and threaded wasm require cross-origin isolation.
- Hardware acceleration and codec support vary by browser.
- Background tabs may throttle timers and workers.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm run test
npm run test:e2e
```

## Project structure

```
app/                 # App Router pages and metadata
components/          # Studio UI blocks
lib/ffmpeg/          # FFmpeg engine + worker client
lib/state/           # Zustand timeline/editor store
lib/storage/         # Dexie IndexedDB layer
lib/utils/           # Time conversion utilities
public/workers/      # Processing worker script
tests/               # Unit and e2e tests
wasm/                # Rust/WASM experimental filters
```

## Next milestones

- Real multi-clip concatenation polish and smarter track snapping.
- Background removal model pipeline.
- OffscreenCanvas renderer path for high-res preview.
- Chunked encoding for large exports.
- Full onboarding tutorial flow and docs expansion.
