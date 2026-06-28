import { createObserveCorpus } from "./generator";
import { waitForEndpointLatency } from "./latency";
import type { OverviewMetric, OverviewMetricKey, Run } from "./domain";

export interface ListRunsOptions {
  cursor?: string | null;
  limit?: number;
  testMode?: boolean;
}

export interface OverviewMetricOptions {
  metric: OverviewMetricKey;
  failMetric?: OverviewMetricKey | null;
  testMode?: boolean;
}

export async function listRunsPayload({
  cursor,
  limit = 10,
  testMode,
}: ListRunsOptions = {}) {
  await waitForEndpointLatency({ endpoint: "runs", testMode });

  const start = Number(cursor ?? 0);
  const safeStart = Number.isFinite(start) && start > 0 ? start : 0;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
  const corpus = createObserveCorpus();
  const runs = corpus.runs.slice(safeStart, safeStart + safeLimit);
  const nextCursor =
    safeStart + runs.length < corpus.runs.length
      ? String(safeStart + runs.length)
      : null;

  return {
    runs,
    nextCursor,
    generatedAt: new Date("2026-02-24T12:00:00.000Z").toISOString(),
  };
}

export async function overviewMetricPayload({
  metric,
  failMetric,
  testMode,
}: OverviewMetricOptions): Promise<OverviewMetric> {
  await waitForEndpointLatency({
    endpoint: endpointForMetric(metric),
    testMode,
  });

  if (failMetric === metric) {
    throw new Error(`Unable to load ${metric} metric.`);
  }

  return createOverviewMetrics().find((item) => item.key === metric)!;
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
      sparkline: bucketCounts(currentRuns, "count"),
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
      sparkline: bucketCounts(currentRuns, "successRate"),
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
      sparkline: bucketCounts(currentRuns, "cost"),
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
      sparkline: bucketCounts(completedRuns, "latency"),
    },
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

function bucketCounts(
  runs: Run[],
  mode: "count" | "successRate" | "cost" | "latency",
) {
  const bucketCount = 8;
  const buckets = Array.from({ length: bucketCount }, () => [] as Run[]);

  runs.forEach((run, index) => {
    buckets[index % bucketCount]?.push(run);
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
      return roundCurrency(sum(bucket, (run) => run.costUsd));
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
