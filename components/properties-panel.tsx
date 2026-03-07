"use client";

import { useEditorStore } from "@/lib/state/editor-store";

type RangeControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
};

function RangeControl({ label, value, min, max, onChange }: RangeControlProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono text-xs text-muted">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function PropertiesPanel() {
  const filters = useEditorStore((state) => state.filters);
  const updateFilters = useEditorStore((state) => state.updateFilters);
  const overlay = useEditorStore((state) => state.overlay);
  const updateOverlay = useEditorStore((state) => state.updateOverlay);
  const transitions = useEditorStore((state) => state.transitions);
  const updateTransitions = useEditorStore((state) => state.updateTransitions);

  return (
    <aside className="panel rounded-2xl p-4">
      <h3 className="mb-3 font-display text-lg">Effects</h3>
      <div className="mb-3 flex gap-2">
        <button
          className="rounded-md border border-border px-2 py-1 text-xs"
          onClick={() => updateFilters({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0 })}
        >
          Reset
        </button>
        <button
          className="rounded-md border border-border px-2 py-1 text-xs"
          onClick={() => updateFilters({ brightness: 110, contrast: 120, grayscale: 0, sepia: 20 })}
        >
          Cinema
        </button>
      </div>
      <div className="space-y-3">
        <RangeControl label="Grayscale" value={filters.grayscale} min={0} max={100} onChange={(v) => updateFilters({ grayscale: v })} />
        <RangeControl label="Sepia" value={filters.sepia} min={0} max={100} onChange={(v) => updateFilters({ sepia: v })} />
        <RangeControl label="Brightness" value={filters.brightness} min={50} max={200} onChange={(v) => updateFilters({ brightness: v })} />
        <RangeControl label="Contrast" value={filters.contrast} min={50} max={200} onChange={(v) => updateFilters({ contrast: v })} />
      </div>

      <h3 className="mb-3 mt-6 font-display text-lg">Overlay</h3>
      <div className="space-y-3 text-sm">
        <label className="flex items-center justify-between gap-2">
          <span>Enable overlay</span>
          <input type="checkbox" checked={overlay.enabled} onChange={(e) => updateOverlay({ enabled: e.target.checked })} />
        </label>

        <label className="flex items-center justify-between gap-2">
          <span>Watermark badge</span>
          <input type="checkbox" checked={overlay.showWatermark} onChange={(e) => updateOverlay({ showWatermark: e.target.checked })} />
        </label>

        <label className="flex flex-col gap-1">
          Overlay text
          <input
            type="text"
            value={overlay.text}
            maxLength={80}
            onChange={(e) => updateOverlay({ text: e.target.value })}
            className="rounded-md border border-border bg-transparent px-2 py-1"
            placeholder="Add text overlay"
          />
        </label>

        <RangeControl label="Opacity" value={overlay.opacity} min={20} max={100} onChange={(v) => updateOverlay({ opacity: v })} />

        <label className="flex flex-col gap-1">
          Position
          <select
            className="rounded-md border border-border bg-transparent px-2 py-1"
            value={overlay.position}
            onChange={(e) => updateOverlay({ position: e.target.value as typeof overlay.position })}
          >
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="bottom-right">Bottom right</option>
          </select>
        </label>
      </div>

      <h3 className="mb-3 mt-6 font-display text-lg">Transitions</h3>
      <div className="space-y-3 text-sm">
        <label className="flex items-center justify-between gap-2">
          <span>Enable fade transitions</span>
          <input
            type="checkbox"
            checked={transitions.enabled}
            onChange={(e) => updateTransitions({ enabled: e.target.checked })}
          />
        </label>
        <RangeControl
          label="Fade In (ms)"
          value={transitions.fadeInMs}
          min={0}
          max={4000}
          onChange={(v) => updateTransitions({ fadeInMs: v })}
        />
        <RangeControl
          label="Fade Out (ms)"
          value={transitions.fadeOutMs}
          min={0}
          max={4000}
          onChange={(v) => updateTransitions({ fadeOutMs: v })}
        />
      </div>
    </aside>
  );
}
