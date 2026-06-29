import { describe, expect, it } from "vitest";

import { createObserveCorpus } from "./generator";

describe("createObserveCorpus", () => {
  it("produces the same corpus for the same seed across reloads", () => {
    const first = createObserveCorpus({ seed: 20260224, runCount: 12 });
    const second = createObserveCorpus({ seed: 20260224, runCount: 12 });

    expect(second).toEqual(first);
    expect(first.runs).toHaveLength(12);
    expect(first.runs[0]).toMatchObject({
      id: "run_0001",
      spanCount: expect.any(Number),
    });
  });

  it("drifts reliability upward so recent runs succeed more often than older ones", () => {
    const { runs } = createObserveCorpus({ runCount: 160 });
    const successRate = (slice: typeof runs) =>
      slice.filter((run) => run.status === "success").length / slice.length;

    expect(
      successRate(runs.slice(0, 60)) - successRate(runs.slice(100, 160)),
    ).toBeGreaterThan(0.2);
  });

  it("spaces runs with varying gaps instead of a fixed cadence", () => {
    const { runs } = createObserveCorpus({ runCount: 40 });
    const gaps = runs
      .slice(0, -1)
      .map(
        (run, index) =>
          Date.parse(run.startedAt) - Date.parse(runs[index + 1]!.startedAt),
      );

    expect(gaps.every((gap) => gap > 0)).toBe(true);
    expect(new Set(gaps).size).toBeGreaterThan(1);
  });
});
