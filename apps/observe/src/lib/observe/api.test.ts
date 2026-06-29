import { describe, expect, it } from "vitest";

import {
  createTraceStreamEvents,
  createOverviewMetrics,
  listRunsPayload,
  overviewMetricPayload,
  runTracePayload,
} from "./api";

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
