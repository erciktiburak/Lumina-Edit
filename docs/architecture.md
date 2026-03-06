# Lumina-Edit Architecture

## Browser-native execution model

Lumina-Edit treats the browser as a local runtime, not a thin client.

- UI rendering and interaction: React + Next.js App Router
- State and history: Zustand in-memory store + snapshot persistence
- Media compute: FFmpeg.wasm + dedicated worker pipeline
- Storage: IndexedDB blobs for local-first asset management

## Processing path

1. User drops a media file into upload zone.
2. Asset metadata and blob are persisted in IndexedDB.
3. Timeline state references immutable asset ids.
4. FFmpeg engine lazy-loads only when processing starts.
5. Export pipeline emits a local `Blob` and triggers download.

## Isolation and security assumptions

- `COOP/COEP` headers are required for `SharedArrayBuffer`.
- No media payload is sent to a backend by default.
- Session analytics remain in browser storage.

## Why this architecture

- Enables privacy-first workflows for sensitive content.
- Removes server-side transcoding costs.
- Allows offline editing with PWA shell.
