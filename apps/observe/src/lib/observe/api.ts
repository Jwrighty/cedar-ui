import { createObserveCorpus } from "./generator";
import { waitForEndpointLatency } from "./latency";
import type { SlowMoMultiplier } from "./latency";
import type {
  CostByModelChart,
  Environment,
  LatencyDistributionChart,
  OverviewChart,
  OverviewChartKey,
  OverviewMetric,
  OverviewMetricKey,
  Run,
  RunsOverTimeChart,
  RunStatus,
  RunTrace,
  TraceStreamEvent,
} from "./domain";
import type { RunSortField, SortDir } from "./runs-query";
import { DEFAULT_SORT } from "./runs-query";

export interface ListRunsOptions {
  cursor?: string | null;
  limit?: number;
  status?: RunStatus | null;
  model?: string | null;
  environment?: Environment | null;
  from?: string | null;
  to?: string | null;
  sortField?: RunSortField;
  sortDir?: SortDir;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}

export interface OverviewMetricOptions {
  metric: OverviewMetricKey;
  failMetric?: OverviewMetricKey | null;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}

export interface OverviewChartOptions {
  chart: OverviewChartKey;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}

export interface RunTraceOptions {
  id: string;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}

export interface OverviewRecentRunsOptions {
  limit?: number;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}

export async function listRunsPayload({
  cursor,
  limit = 10,
  status = null,
  model = null,
  environment = null,
  from = null,
  to = null,
  sortField = DEFAULT_SORT.field,
  sortDir = DEFAULT_SORT.dir,
  testMode,
  slowMoMultiplier,
}: ListRunsOptions = {}) {
  await waitForEndpointLatency({
    endpoint: "runs",
    testMode,
    slowMoMultiplier,
  });

  const start = Number(cursor ?? 0);
  const safeStart = Number.isFinite(start) && start > 0 ? start : 0;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;

  const fromMs = from ? Date.parse(from) : null;
  const toMs = to ? Date.parse(to) : null;

  const filtered = createObserveCorpus().runs.filter((run) => {
    if (status && run.status !== status) return false;
    if (model && run.model !== model) return false;
    if (environment && run.environment !== environment) return false;
    const startedMs = Date.parse(run.startedAt);
    if (fromMs !== null && startedMs < fromMs) return false;
    if (toMs !== null && startedMs > toMs) return false;
    return true;
  });

  const sorted = sortRuns(filtered, sortField, sortDir);
  const page = sorted.slice(safeStart, safeStart + safeLimit);
  const nextCursor =
    safeStart + page.length < sorted.length
      ? String(safeStart + page.length)
      : null;

  return {
    runs: page,
    nextCursor,
    generatedAt: new Date("2026-02-24T12:00:00.000Z").toISOString(),
  };
}

export async function overviewRecentRunsPayload({
  limit = 5,
  testMode,
  slowMoMultiplier,
}: OverviewRecentRunsOptions = {}) {
  await waitForEndpointLatency({
    endpoint: "overviewRecentRuns",
    testMode,
    slowMoMultiplier,
  });

  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 8) : 5;
  const corpus = createObserveCorpus();

  return {
    runs: corpus.runs.slice(0, safeLimit),
    generatedAt: new Date("2026-02-24T12:00:00.000Z").toISOString(),
  };
}

export async function overviewMetricPayload({
  metric,
  failMetric,
  testMode,
  slowMoMultiplier,
}: OverviewMetricOptions): Promise<OverviewMetric> {
  await waitForEndpointLatency({
    endpoint: endpointForMetric(metric),
    testMode,
    slowMoMultiplier,
  });

  if (failMetric === metric) {
    throw new Error(`Unable to load ${metric} metric.`);
  }

  return createOverviewMetrics().find((item) => item.key === metric)!;
}

export async function overviewChartPayload({
  chart,
  testMode,
  slowMoMultiplier,
}: OverviewChartOptions): Promise<OverviewChart> {
  await waitForEndpointLatency({
    endpoint: endpointForChart(chart),
    testMode,
    slowMoMultiplier,
  });

  return createOverviewCharts().find((item) => item.key === chart)!;
}

export async function runTracePayload({
  id,
  testMode,
  slowMoMultiplier,
}: RunTraceOptions): Promise<RunTrace | null> {
  await waitForEndpointLatency({
    endpoint: "runDetail",
    testMode,
    slowMoMultiplier,
  });

  const corpus = createObserveCorpus();
  const run = corpus.runs.find((item) => item.id === id);

  if (!run) {
    return null;
  }

  return {
    run,
    spans: corpus.spans
      .filter((span) => span.runId === id)
      .sort((a, b) => a.startOffsetMs - b.startOffsetMs),
    messages: corpus.messages.filter((message) =>
      corpus.spans.some(
        (span) => span.runId === id && span.id === message.spanId,
      ),
    ),
  };
}

export function createTraceStreamEvents(trace: RunTrace): TraceStreamEvent[] {
  const events: TraceStreamEvent[] = [];
  const assistantMessages = trace.messages.filter(
    (message) => message.role === "assistant",
  );

  for (const span of trace.spans) {
    events.push({ type: "span", spanId: span.id });

    const message = assistantMessages.find((item) => item.spanId === span.id);

    if (message) {
      for (const token of tokenizeAssistantOutput(message.content)) {
        events.push({ type: "token", spanId: span.id, token });
      }
    }
  }

  events.push({
    type: "complete",
    result: `${trace.run.label} ${trace.run.status === "running" ? "is still running" : `settled as ${trace.run.status}`}.`,
  });

  return events;
}

export function createOverviewMetrics(): OverviewMetric[] {
  const { runs } = createObserveCorpus();
  const currentRuns = runs.slice(0, 72);
  const previousRuns = runs.slice(72, 144);
  const completedRuns = currentRuns.filter((run) => run.durationMs !== null);
  const previousCompletedRuns = previousRuns.filter(
    (run) => run.durationMs !== null,
  );

  return [
    {
      key: "runs",
      label: "Runs",
      value: currentRuns.length,
      delta: deltaPercent(currentRuns.length, previousRuns.length, "positive"),
      sparkline: bucketSeries(currentRuns, "count"),
    },
    {
      key: "successRate",
      label: "Success rate",
      value: ratio(
        currentRuns.filter((run) => run.status === "success").length,
        currentRuns.length,
      ),
      delta: deltaPercent(
        ratio(
          currentRuns.filter((run) => run.status === "success").length,
          currentRuns.length,
        ),
        ratio(
          previousRuns.filter((run) => run.status === "success").length,
          previousRuns.length,
        ),
        "positive",
      ),
      sparkline: bucketSeries(currentRuns, "successRate"),
    },
    {
      key: "totalCost",
      label: "Total cost",
      value: roundCurrency(sum(currentRuns, (run) => run.costUsd)),
      delta: deltaPercent(
        sum(currentRuns, (run) => run.costUsd),
        sum(previousRuns, (run) => run.costUsd),
        "negative",
      ),
      sparkline: bucketSeries(currentRuns, "cost"),
    },
    {
      key: "p95Latency",
      label: "P95 latency",
      value: percentile(
        completedRuns.map((run) => run.durationMs ?? 0),
        0.95,
      ),
      delta: deltaPercent(
        percentile(
          completedRuns.map((run) => run.durationMs ?? 0),
          0.95,
        ),
        percentile(
          previousCompletedRuns.map((run) => run.durationMs ?? 0),
          0.95,
        ),
        "negative",
      ),
      sparkline: bucketSeries(completedRuns, "latency"),
    },
  ];
}

export function createOverviewCharts(): OverviewChart[] {
  const { runs } = createObserveCorpus();
  const currentRuns = runs.slice(0, 144);
  const completedRuns = currentRuns.filter(
    (run): run is Run & { durationMs: number } => run.durationMs !== null,
  );

  return [
    createRunsOverTimeChart(currentRuns),
    createCostByModelChart(currentRuns),
    createLatencyDistributionChart(completedRuns),
  ];
}

function endpointForMetric(metric: OverviewMetricKey) {
  switch (metric) {
    case "runs":
      return "overviewMetricRuns";
    case "successRate":
      return "overviewMetricSuccessRate";
    case "totalCost":
      return "overviewMetricTotalCost";
    case "p95Latency":
      return "overviewMetricP95Latency";
  }
}

function endpointForChart(chart: OverviewChartKey) {
  switch (chart) {
    case "runs-over-time":
      return "overviewChartRunsOverTime";
    case "cost-by-model":
      return "overviewChartCostByModel";
    case "latency-distribution":
      return "overviewChartLatencyDistribution";
  }
}

function createRunsOverTimeChart(runs: Run[]): RunsOverTimeChart {
  return {
    key: "runs-over-time",
    title: "Runs over time",
    summary: "Run volume across the current 12-hour operating window.",
    points: bucketSeries(runs, "count", 12).map((value, index) => ({
      label: `${String(index * 2).padStart(2, "0")}:00`,
      value,
    })),
  };
}

function createCostByModelChart(runs: Run[]): CostByModelChart {
  const byModel = new Map<string, { costUsd: number; runCount: number }>();

  for (const run of runs) {
    const current = byModel.get(run.model) ?? { costUsd: 0, runCount: 0 };
    current.costUsd += run.costUsd;
    current.runCount += 1;
    byModel.set(run.model, current);
  }

  return {
    key: "cost-by-model",
    title: "Cost by model",
    summary: "Spend distribution across the active model mix.",
    rows: Array.from(byModel, ([model, value]) => ({
      model,
      costUsd: roundCurrency(value.costUsd),
      runCount: value.runCount,
    })).sort((a, b) => b.costUsd - a.costUsd),
  };
}

function createLatencyDistributionChart(
  runs: Array<Run & { durationMs: number }>,
): LatencyDistributionChart {
  const bucketSizeMs = 2000;
  const bucketCount = 5;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const minMs = index * bucketSizeMs;
    const maxMs = (index + 1) * bucketSizeMs;

    return {
      label:
        index === bucketCount - 1
          ? `${minMs / 1000}s+`
          : `${minMs / 1000}-${maxMs / 1000}s`,
      minMs,
      maxMs,
      count: 0,
    };
  });

  for (const run of runs) {
    const index = Math.min(
      bucketCount - 1,
      Math.floor(run.durationMs / bucketSizeMs),
    );
    buckets[index]!.count += 1;
  }

  return {
    key: "latency-distribution",
    title: "Latency distribution",
    summary: "Completed run latency clustered into response-time bands.",
    buckets,
  };
}

function deltaPercent(
  current: number,
  previous: number,
  preferredDirection: "positive" | "negative",
) {
  const value =
    previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
  const isImprovement =
    preferredDirection === "positive" ? value >= 0 : value <= 0;

  return {
    direction:
      value === 0
        ? ("neutral" as const)
        : isImprovement
          ? ("positive" as const)
          : ("negative" as const),
    value,
    unit: "percent" as const,
  };
}

export function bucketSeries(
  runs: Run[],
  mode: "count" | "successRate" | "cost" | "latency",
  bucketCount = 8,
) {
  const buckets = Array.from({ length: bucketCount }, () => [] as Run[]);
  const times = runs.map((run) => Date.parse(run.startedAt));
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;

  runs.forEach((run, index) => {
    const bucket = Math.min(
      bucketCount - 1,
      Math.floor(((times[index]! - min) / span) * bucketCount),
    );
    buckets[bucket]?.push(run);
  });

  return buckets.map((bucket) => {
    if (mode === "count") return bucket.length;
    if (mode === "successRate") {
      return Math.round(
        ratio(
          bucket.filter((run) => run.status === "success").length,
          bucket.length,
        ) * 100,
      );
    }
    if (mode === "cost") {
      // Round only to shed float noise — cent-rounding here would collapse the
      // small per-bucket sums into one or two values and flatten the series.
      return Math.round(sum(bucket, (run) => run.costUsd) * 10000) / 10000;
    }

    return percentile(
      bucket
        .map((run) => run.durationMs)
        .filter((duration): duration is number => duration !== null),
      0.95,
    );
  });
}

function ratio(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * percentileValue) - 1,
  );
  return sorted[index] ?? 0;
}

function sum(runs: Run[], getValue: (run: Run) => number) {
  return runs.reduce((total, run) => total + getValue(run), 0);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function tokenizeAssistantOutput(content: string) {
  const tokens = content.match(/\S+\s*/g);
  return tokens && tokens.length > 0 ? tokens : [content];
}

function sortValue(run: Run, field: RunSortField): number | string {
  switch (field) {
    case "time":
      return Date.parse(run.startedAt);
    case "label":
      return run.label;
    case "model":
      return run.model;
    case "status":
      return run.status;
    case "tokens":
      return run.tokensIn + run.tokensOut;
    case "cost":
      return run.costUsd;
    case "latency":
      return run.durationMs ?? -1; // running runs sort as lowest latency
  }
}

function sortRuns(runs: Run[], field: RunSortField, dir: SortDir): Run[] {
  const factor = dir === "asc" ? 1 : -1;
  // Stable sort with id as a deterministic tie-breaker.
  return [...runs].sort((a, b) => {
    const av = sortValue(a, field);
    const bv = sortValue(b, field);
    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv));
    if (cmp !== 0) return cmp * factor;
    return a.id.localeCompare(b.id) * factor;
  });
}

export function runsFacets(): {
  models: string[];
  environments: Environment[];
  referenceTime: string;
} {
  const runs = createObserveCorpus().runs;
  const models = Array.from(new Set(runs.map((r) => r.model))).sort();
  const environments = Array.from(
    new Set(runs.map((r) => r.environment)),
  ) as Environment[];
  const referenceTime = runs.reduce(
    (latest, r) =>
      Date.parse(r.startedAt) > Date.parse(latest) ? r.startedAt : latest,
    runs[0]!.startedAt,
  );
  return { models, environments: environments.sort(), referenceTime };
}

export function applyRunTag({
  id,
  tag,
  op,
}: {
  id: string;
  tag: string;
  op: "add" | "remove";
}): { id: string; tags: string[] } {
  if (tag === "fail") {
    throw new Error("Tag rejected");
  }
  const run =
    createObserveCorpus().runs.find((r) => r.id === id) ??
    ({ tags: [] } as unknown as Run);
  const current = new Set(run.tags);
  if (op === "add") current.add(tag);
  else current.delete(tag);
  return { id, tags: Array.from(current) };
}

export function appendedRuns(count: number): Run[] {
  const facets = runsFacets();
  const baseMs = Date.parse(facets.referenceTime);
  const corpus = createObserveCorpus();
  const template = corpus.runs;
  return Array.from({ length: count }, (_, i) => {
    const source = template[i % template.length]!;
    return {
      ...source,
      id: `run_appended_${String(i + 1).padStart(4, "0")}`,
      label: `${source.agentName} #${String(9000 + i)}`,
      status: "running",
      durationMs: null,
      startedAt: new Date(baseMs + (i + 1) * 1000).toISOString(),
      tags: [],
    };
  });
}

export type LiveFeedEvent =
  | { type: "run"; run: Run }
  | { type: "status"; id: string; status: RunStatus; durationMs: number };

export function liveFeedEvents(count: number): LiveFeedEvent[] {
  const runs = appendedRuns(count);
  const runEvents: LiveFeedEvent[] = runs.map((run) => ({ type: "run", run }));
  const statusEvents: LiveFeedEvent[] = runs.map((run, i) => ({
    type: "status",
    id: run.id,
    status: i % 4 === 3 ? "error" : "success", // deterministic settle
    durationMs: 1200 + i * 300,
  }));
  return [...runEvents, ...statusEvents]; // all rows arrive, then settle
}
