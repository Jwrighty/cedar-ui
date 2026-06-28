import { describe, expect, it } from "vitest";

import {
  createOverviewMetrics,
  listRunsPayload,
  overviewMetricPayload,
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
