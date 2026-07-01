import { describe, expect, it } from "vitest";

import {
  appendedRuns,
  applyRunTag,
  bucketSeries,
  createOverviewCharts,
  createTraceStreamEvents,
  createOverviewMetrics,
  overviewRecentRunsPayload,
  listRunsPayload,
  overviewChartPayload,
  overviewMetricPayload,
  runTracePayload,
  runsFacets,
} from "./api";
import type { Run } from "./domain";

function makeRun(startedAt: string, overrides: Partial<Run> = {}): Run {
  return {
    id: `run_${startedAt}`,
    label: "Run",
    agentName: "Agent",
    model: "gpt-5.1",
    status: "success",
    environment: "production",
    startedAt,
    durationMs: 1000,
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0,
    spanCount: 1,
    sessionId: "session_1",
    tags: [],
    ...overrides,
  };
}

describe("listRunsPayload", () => {
  it("serves seeded runs through the shared latency-aware API payload", async () => {
    const startedAt = performance.now();
    const payload = await listRunsPayload({ testMode: true });

    expect(performance.now() - startedAt).toBeLessThan(100);
    expect(payload.runs).toHaveLength(10);
    expect(payload.nextCursor).toBe("10");
    expect(payload.runs[0]?.id).toBe("run_0001");
  });

  it("falls back to the default page size when limit input is invalid", async () => {
    const payload = await listRunsPayload({
      limit: Number.NaN,
      testMode: true,
    });

    expect(payload.runs).toHaveLength(10);
    expect(payload.nextCursor).toBe("10");
  });
});

describe("overviewRecentRunsPayload", () => {
  it("serves the newest runs for the Overview preview", async () => {
    const startedAt = performance.now();
    const payload = await overviewRecentRunsPayload({ testMode: true });

    expect(performance.now() - startedAt).toBeLessThan(4000);
    expect(payload.runs).toHaveLength(5);
    expect(payload.runs[0]).toMatchObject({
      id: "run_0001",
      label: expect.any(String),
      status: expect.stringMatching(/running|success|error/),
    });
    expect(payload.generatedAt).toBe("2026-02-24T12:00:00.000Z");
  });
});

describe("bucketSeries", () => {
  it("bins runs into contiguous chronological buckets, oldest first", () => {
    const runs = [
      makeRun("2026-02-24T10:15:00.000Z", { costUsd: 4 }),
      makeRun("2026-02-24T10:00:00.000Z", { costUsd: 1 }),
      makeRun("2026-02-24T10:10:00.000Z", { costUsd: 3 }),
      makeRun("2026-02-24T10:05:00.000Z", { costUsd: 2 }),
    ];

    expect(bucketSeries(runs, "cost", 2)).toEqual([3, 7]);
  });

  it("bins by equal time width so run volume varies with arrival density", () => {
    const runs = [
      makeRun("2026-02-24T10:00:00.000Z"),
      makeRun("2026-02-24T10:01:00.000Z"),
      makeRun("2026-02-24T10:02:00.000Z"),
      makeRun("2026-02-24T10:20:00.000Z"),
    ];

    expect(bucketSeries(runs, "count", 2)).toEqual([3, 1]);
  });

  it("keeps sub-cent variation in the cost series instead of rounding to whole cents", () => {
    const runs = [
      makeRun("2026-02-24T10:00:00.000Z", { costUsd: 0.061 }),
      makeRun("2026-02-24T10:05:00.000Z", { costUsd: 0.066 }),
    ];

    expect(bucketSeries(runs, "cost", 2)).toEqual([0.061, 0.066]);
  });
});

describe("createOverviewMetrics", () => {
  it("returns the four headline metrics in display order", () => {
    const metrics = createOverviewMetrics();

    expect(metrics.map((metric) => metric.key)).toEqual([
      "runs",
      "successRate",
      "totalCost",
      "p95Latency",
    ]);
    expect(metrics[0]).toMatchObject({
      key: "runs",
      label: "Runs",
      value: 72,
    });
    expect(metrics.every((metric) => metric.sparkline.length === 8)).toBe(true);
  });
});

describe("createOverviewCharts", () => {
  it("returns the three overview charts in display order", () => {
    const charts = createOverviewCharts();

    expect(charts.map((chart) => chart.key)).toEqual([
      "runs-over-time",
      "cost-by-model",
      "latency-distribution",
    ]);
    expect(charts[0]).toMatchObject({
      key: "runs-over-time",
      title: "Runs over time",
    });
    expect(
      charts[0]?.key === "runs-over-time" && charts[0].points,
    ).toHaveLength(12);
  });

  it("sorts model cost bars by descending spend", () => {
    const chart = createOverviewCharts().find(
      (item) => item.key === "cost-by-model",
    );

    expect(chart?.key).toBe("cost-by-model");
    if (chart?.key !== "cost-by-model") return;

    expect(chart.rows.length).toBeGreaterThan(1);
    expect(chart.rows[0]!.costUsd).toBeGreaterThanOrEqual(
      chart.rows.at(-1)!.costUsd,
    );
  });
});

describe("overviewChartPayload", () => {
  it("serves an individual chart through the latency-aware payload", async () => {
    const startedAt = performance.now();
    const chart = await overviewChartPayload({
      chart: "latency-distribution",
      testMode: true,
    });

    expect(performance.now() - startedAt).toBeLessThan(3500);
    expect(chart).toMatchObject({
      key: "latency-distribution",
      title: "Latency distribution",
    });
    expect(chart.key === "latency-distribution" && chart.buckets).toHaveLength(
      5,
    );
  });
});

describe("overviewMetricPayload", () => {
  it("serves an individual metric through the latency-aware payload", async () => {
    const startedAt = performance.now();
    const metric = await overviewMetricPayload({
      metric: "successRate",
      testMode: true,
    });

    expect(performance.now() - startedAt).toBeLessThan(2500);
    expect(metric).toMatchObject({
      key: "successRate",
      label: "Success rate",
      value: expect.any(Number),
    });
  });

  it("can fail one requested metric without affecting the aggregate helpers", async () => {
    await expect(
      overviewMetricPayload({
        metric: "totalCost",
        failMetric: "totalCost",
        testMode: true,
      }),
    ).rejects.toThrow("Unable to load totalCost metric.");

    expect(createOverviewMetrics().map((metric) => metric.key)).toContain(
      "runs",
    );
  });
});

describe("runTracePayload", () => {
  it("serves one run with its nested spans and messages", async () => {
    const trace = await runTracePayload({
      id: "run_0001",
      testMode: true,
    });

    expect(trace?.run.id).toBe("run_0001");
    expect(trace?.spans.length).toBe(trace?.run.spanCount);
    expect(trace?.spans[0]).toMatchObject({
      parentSpanId: null,
      startOffsetMs: 0,
    });
    expect(trace?.spans.some((span) => span.parentSpanId !== null)).toBe(true);
    expect(trace?.messages[0]).toMatchObject({
      spanId: trace?.spans[0]?.id,
      role: "assistant",
    });
  });

  it("returns null for an unknown run id", async () => {
    await expect(
      runTracePayload({ id: "run_unknown", testMode: true }),
    ).resolves.toBeNull();
  });
});

describe("createTraceStreamEvents", () => {
  it("reveals spans, streams assistant tokens, and announces completion once", async () => {
    const trace = await runTracePayload({
      id: "run_0001",
      testMode: true,
    });

    expect(trace).not.toBeNull();

    const events = createTraceStreamEvents(trace!);

    expect(events[0]).toEqual({
      type: "span",
      spanId: trace!.spans[0]?.id,
    });
    expect(events.some((event) => event.type === "token")).toBe(true);
    expect(events.at(-1)).toEqual({
      type: "complete",
      result: `${trace!.run.label} settled as ${trace!.run.status}.`,
    });
  });
});

describe("listRunsPayload filtering + sorting", () => {
  it("filters by status", async () => {
    const { runs } = await listRunsPayload({
      status: "error",
      limit: 100,
      testMode: true,
    });
    expect(runs.length).toBeGreaterThan(0);
    expect(runs.every((r) => r.status === "error")).toBe(true);
  });

  it("filters by model and environment", async () => {
    const { runs } = await listRunsPayload({
      model: "o4-mini",
      environment: "staging",
      limit: 100,
      testMode: true,
    });
    expect(
      runs.every((r) => r.model === "o4-mini" && r.environment === "staging"),
    ).toBe(true);
  });

  it("sorts by cost ascending", async () => {
    const { runs } = await listRunsPayload({
      sortField: "cost",
      sortDir: "asc",
      limit: 100,
      testMode: true,
    });
    const costs = runs.map((r) => r.costUsd);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
  });

  it("defaults to newest-first by time", async () => {
    const { runs } = await listRunsPayload({ limit: 5, testMode: true });
    const times = runs.map((r) => Date.parse(r.startedAt));
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("paginates the filtered+sorted set via cursor", async () => {
    const first = await listRunsPayload({
      status: "success",
      limit: 10,
      testMode: true,
    });
    expect(first.nextCursor).not.toBeNull();
    const second = await listRunsPayload({
      status: "success",
      cursor: first.nextCursor,
      limit: 10,
      testMode: true,
    });
    const overlap = first.runs.filter((r) =>
      second.runs.some((s) => s.id === r.id),
    );
    expect(overlap).toHaveLength(0);
  });

  it("returns an empty page when nothing matches", async () => {
    const { runs, nextCursor } = await listRunsPayload({
      status: "error",
      model: "does-not-exist",
      limit: 100,
      testMode: true,
    });
    expect(runs).toHaveLength(0);
    expect(nextCursor).toBeNull();
  });

  it("filters by from/to on startedAt", async () => {
    const facets = runsFacets();
    const from = new Date(
      Date.parse(facets.referenceTime) - 60 * 60 * 1000,
    ).toISOString();
    const { runs } = await listRunsPayload({
      from,
      limit: 100,
      testMode: true,
    });
    expect(runs.every((r) => Date.parse(r.startedAt) >= Date.parse(from))).toBe(
      true,
    );
  });
});

describe("runsFacets", () => {
  it("returns distinct models, environments, and a reference time", () => {
    const facets = runsFacets();
    expect(facets.models.length).toBeGreaterThan(1);
    expect(new Set(facets.models).size).toBe(facets.models.length);
    expect(facets.environments).toEqual(
      expect.arrayContaining(["production", "staging"]),
    );
    expect(Number.isNaN(Date.parse(facets.referenceTime))).toBe(false);
  });
});

describe("appendedRuns", () => {
  it("is deterministic and sorts after the reference time", () => {
    expect(appendedRuns(3)).toEqual(appendedRuns(3));
    const facets = runsFacets();
    for (const run of appendedRuns(3)) {
      expect(Date.parse(run.startedAt)).toBeGreaterThan(
        Date.parse(facets.referenceTime),
      );
      expect(run.id).toMatch(/^run_appended_/);
    }
  });
});

describe("applyRunTag", () => {
  it("adds and removes tags", () => {
    const added = applyRunTag({ id: "run_0001", tag: "customer", op: "add" });
    expect(added.tags).toContain("customer");
    const removed = applyRunTag({
      id: "run_0001",
      tag: "customer",
      op: "remove",
    });
    expect(removed.tags).not.toContain("customer");
  });

  it("throws for the deterministic failure tag", () => {
    expect(() =>
      applyRunTag({ id: "run_0001", tag: "fail", op: "add" }),
    ).toThrow();
  });
});
