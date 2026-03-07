"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { detectCapabilities } from "@/lib/compat/browser-check";
import { ffmpegEngine } from "@/lib/ffmpeg/engine";
import { useEditorStore } from "@/lib/state/editor-store";
import { EffectPresetLibrary } from "@/components/effect-preset-library";
import { ExportModal } from "@/components/export-modal";
import { AudioWaveform } from "@/components/audio-waveform";
import { LogConsole } from "@/components/log-console";
import { MetricsPanel } from "@/components/metrics-panel";
import { PropertiesPanel } from "@/components/properties-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Timeline } from "@/components/timeline";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { UploadZone } from "@/components/upload-zone";
import { VideoPlayer } from "@/components/video-player";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const addLog = useEditorStore((state) => state.addLog);
  const addClip = useEditorStore((state) => state.addClip);
  const currentAssetId = useEditorStore((state) => state.currentAssetId);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const saveSnapshot = useEditorStore((state) => state.saveSnapshot);
  const loadSnapshot = useEditorStore((state) => state.loadSnapshot);

  useEffect(() => {
    const unsub = ffmpegEngine.onLog((line) => {
      const ts = new Date().toISOString().slice(11, 19);
      addLog(`[${ts}] ${line}`);
    });
    void loadSnapshot();
    return () => unsub();
  }, [addLog, loadSnapshot]);

  useEffect(() => {
    const capabilities = detectCapabilities();
    if (!capabilities.crossOriginIsolated) {
      addLog("Cross-origin isolation is disabled; multithreaded wasm may fail.");
    }
    if (!capabilities.webGpuReady) {
      addLog("WebGPU unavailable. Falling back to canvas-based preview.");
    }
  }, [addLog]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        addLog("Service worker registration failed.");
      });
    }
  }, [addLog]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        void saveSnapshot();
      }
    };

    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [redo, saveSnapshot, undo]);

  useEffect(() => {
    if (!file || !currentAssetId) return;

    const clipId = crypto.randomUUID();
    addClip({
      id: clipId,
      assetId: currentAssetId,
      trackId: "video-track-1",
      startMs: 0,
      endMs: 5000,
      offsetMs: 0,
      speed: 1
    });

    const timer = window.setInterval(() => {
      void saveSnapshot();
    }, 7000);

    return () => window.clearInterval(timer);
  }, [addClip, currentAssetId, file, saveSnapshot]);

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <TutorialOverlay />

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Browser-native studio</p>
          <h1 className="font-display text-3xl md:text-4xl">Lumina-Edit</h1>
          <p className="text-sm text-muted">Privacy-first local video and image processing engine.</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ExportModal file={file} />
        </div>
      </motion.header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          <UploadZone onFileReady={setFile} />
          <VideoPlayer file={file} />
          <Timeline />
          <AudioWaveform file={file} />
          <LogConsole />
        </section>
        <section className="space-y-4">
          <EffectPresetLibrary />
          <PropertiesPanel />
          <MetricsPanel />
        </section>
      </motion.div>
    </main>
  );
}
