"use client";

import { useEditorStore } from "@/lib/state/editor-store";

export function LogConsole() {
  const logs = useEditorStore((state) => state.logs);
  const clearLogs = useEditorStore((state) => state.clearLogs);
  return (
    <section className="panel rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-lg">FFmpeg Logs</h3>
        <button className="rounded-md border border-border px-2 py-1 text-xs" onClick={clearLogs}>
          Clear
        </button>
      </div>
      <div className="h-36 overflow-y-auto rounded-lg bg-black p-2 font-mono text-xs text-green-400">
        {logs.length ? logs.map((line, index) => <div key={`${line}-${index}`}>{line}</div>) : <div>Engine logs will appear here...</div>}
      </div>
    </section>
  );
}
