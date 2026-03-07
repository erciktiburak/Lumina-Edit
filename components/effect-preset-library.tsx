"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/state/editor-store";

type EffectPreset = {
  id: string;
  name: string;
  description: string;
  swatchClass: string;
  filters: {
    grayscale: number;
    sepia: number;
    brightness: number;
    contrast: number;
  };
  overlay: {
    enabled: boolean;
    text: string;
    showWatermark: boolean;
    opacity: number;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
  transitions: {
    enabled: boolean;
    fadeInMs: number;
    fadeOutMs: number;
  };
  playback: {
    speed: number;
  };
};

const presets: EffectPreset[] = [
  {
    id: "clean-default",
    name: "Clean Default",
    description: "Neutral grade for raw local edits.",
    swatchClass: "from-slate-700 to-slate-500",
    filters: { grayscale: 0, sepia: 0, brightness: 100, contrast: 100 },
    overlay: { enabled: false, text: "Lumina Edit", showWatermark: true, opacity: 70, position: "top-right" },
    transitions: { enabled: false, fadeInMs: 500, fadeOutMs: 500 },
    playback: { speed: 1 }
  },
  {
    id: "cinema-cut",
    name: "Cinema Cut",
    description: "Warm contrast with gentle fade heads.",
    swatchClass: "from-amber-900 to-orange-500",
    filters: { grayscale: 0, sepia: 24, brightness: 112, contrast: 126 },
    overlay: { enabled: true, text: "CINEMA CUT", showWatermark: true, opacity: 74, position: "bottom-right" },
    transitions: { enabled: true, fadeInMs: 700, fadeOutMs: 900 },
    playback: { speed: 1 }
  },
  {
    id: "mono-story",
    name: "Mono Story",
    description: "Documentary monochrome with softer roll-off.",
    swatchClass: "from-zinc-900 to-zinc-500",
    filters: { grayscale: 85, sepia: 8, brightness: 106, contrast: 118 },
    overlay: { enabled: true, text: "FIELD LOG", showWatermark: false, opacity: 78, position: "top-left" },
    transitions: { enabled: true, fadeInMs: 500, fadeOutMs: 600 },
    playback: { speed: 0.75 }
  },
  {
    id: "social-fast",
    name: "Social Fast",
    description: "Bright cut for quick vertical clips.",
    swatchClass: "from-cyan-700 to-sky-500",
    filters: { grayscale: 0, sepia: 4, brightness: 120, contrast: 132 },
    overlay: { enabled: true, text: "@lumina", showWatermark: true, opacity: 88, position: "top-right" },
    transitions: { enabled: true, fadeInMs: 260, fadeOutMs: 320 },
    playback: { speed: 1.35 }
  }
];

export function EffectPresetLibrary() {
  const updateFilters = useEditorStore((state) => state.updateFilters);
  const updateOverlay = useEditorStore((state) => state.updateOverlay);
  const updateTransitions = useEditorStore((state) => state.updateTransitions);
  const updatePlayback = useEditorStore((state) => state.updatePlayback);
  const [appliedPresetId, setAppliedPresetId] = useState<string>("clean-default");

  return (
    <aside className="panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg">Effect Presets</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Real-time</span>
      </div>

      <div className="space-y-2">
        {presets.map((preset) => {
          const isApplied = appliedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              className={`w-full rounded-xl border p-3 text-left transition ${
                isApplied ? "border-accent bg-accent/10" : "border-border hover:border-accent/60"
              }`}
              onClick={() => {
                updateFilters(preset.filters);
                updateOverlay(preset.overlay);
                updateTransitions(preset.transitions);
                updatePlayback(preset.playback);
                setAppliedPresetId(preset.id);
              }}
            >
              <div className={`mb-2 h-8 w-full rounded-md bg-gradient-to-r ${preset.swatchClass}`} />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{preset.name}</p>
                  <p className="text-xs text-muted">{preset.description}</p>
                </div>
                {isApplied && (
                  <span className="rounded border border-accent px-2 py-0.5 font-mono text-[10px] text-accent">Applied</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
