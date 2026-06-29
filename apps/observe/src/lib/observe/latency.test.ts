import { afterEach, describe, expect, it, vi } from "vitest";

import { parseSlowMoMultiplier, waitForEndpointLatency } from "./latency";

describe("parseSlowMoMultiplier", () => {
  it("accepts the supported demo speeds and falls back to normal speed", () => {
    expect(parseSlowMoMultiplier("1")).toBe(1);
    expect(parseSlowMoMultiplier("2")).toBe(2);
    expect(parseSlowMoMultiplier("4")).toBe(4);
    expect(parseSlowMoMultiplier(["2", "4"])).toBe(2);
    expect(parseSlowMoMultiplier("3")).toBe(1);
    expect(parseSlowMoMultiplier(null)).toBe(1);
  });
});

describe("waitForEndpointLatency", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("scales mock endpoint latency by the slow-mo multiplier", async () => {
    vi.useFakeTimers();

    let settled = false;
    const wait = waitForEndpointLatency({
      endpoint: "overviewMetricRuns",
      slowMoMultiplier: 2,
    }).then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(79);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await wait;

    expect(settled).toBe(true);
  });
});
