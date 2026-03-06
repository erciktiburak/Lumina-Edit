const METRIC_KEY = "lumina-metrics";

type MetricState = {
  sessions: number;
  processedClips: number;
  exports: number;
  totalProcessedMs: number;
};

const initialState: MetricState = {
  sessions: 0,
  processedClips: 0,
  exports: 0,
  totalProcessedMs: 0
};

const readMetrics = (): MetricState => {
  if (typeof window === "undefined") return initialState;
  const raw = localStorage.getItem(METRIC_KEY);
  if (!raw) return initialState;
  try {
    return { ...initialState, ...JSON.parse(raw) } as MetricState;
  } catch {
    return initialState;
  }
};

const writeMetrics = (state: MetricState) => {
  localStorage.setItem(METRIC_KEY, JSON.stringify(state));
};

export const metrics = {
  incrementSession() {
    const state = readMetrics();
    writeMetrics({ ...state, sessions: state.sessions + 1 });
  },
  addProcessedClip(durationMs: number) {
    const state = readMetrics();
    writeMetrics({
      ...state,
      processedClips: state.processedClips + 1,
      totalProcessedMs: state.totalProcessedMs + Math.max(0, durationMs)
    });
  },
  incrementExport() {
    const state = readMetrics();
    writeMetrics({ ...state, exports: state.exports + 1 });
  },
  get(): MetricState {
    return readMetrics();
  }
};
