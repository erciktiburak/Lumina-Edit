"use client";

import { useEditorStore } from "@/lib/state/editor-store";

export function LogConsole() {
  const logs = useEditorStore((state) => state.logs);
  return (
    <section className="panel rounded-2xl p-4">
      <h3 className="mb-2 font-display text-lg">FFmpeg Logs</h3>
      <div className="h-36 overflow-y-auto rounded-lg bg-black p-2 font-mono text-xs text-green-400">
        {logs.length ? logs.map((line, index) => <div key={`${line}-${index}`}>{line}</div>) : <div>Engine logs will appear here...</div>}
      </div>
    </section>
  );
}
