import { describe, expect, it } from "vitest";

import {
  bucketSeries,
  createOverviewCharts,
  createTraceStreamEvents,
  createOverviewMetrics,
  listRunsPayload,
  overviewChartPayload,
  overviewMetricPayload,
  runTracePayload,
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
