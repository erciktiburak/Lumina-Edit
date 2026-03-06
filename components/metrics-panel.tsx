"use client";

import { useEffect, useState } from "react";
import { metrics } from "@/lib/analytics/local-metrics";

type MetricSnapshot = ReturnType<typeof metrics.get>;

export function MetricsPanel() {
  const [snapshot, setSnapshot] = useState<MetricSnapshot>(metrics.get());

  useEffect(() => {
    metrics.incrementSession();
    setSnapshot(metrics.get());
  }, []);

  return (
    <section className="panel rounded-2xl p-4">
      <h3 className="mb-3 font-display text-lg">Local Metrics</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border p-2">
          <div className="text-muted">Sessions</div>
          <div className="text-lg font-semibold">{snapshot.sessions}</div>
        </div>
        <div className="rounded-lg border border-border p-2">
          <div className="text-muted">Exports</div>
          <div className="text-lg font-semibold">{snapshot.exports}</div>
        </div>
        <div className="rounded-lg border border-border p-2">
          <div className="text-muted">Processed Clips</div>
          <div className="text-lg font-semibold">{snapshot.processedClips}</div>
        </div>
        <div className="rounded-lg border border-border p-2">
          <div className="text-muted">Timeline Minutes</div>
          <div className="text-lg font-semibold">{Math.floor(snapshot.totalProcessedMs / 60000)}</div>
        </div>
      </div>
    </section>
  );
}
