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
    </aside>
  );
}
