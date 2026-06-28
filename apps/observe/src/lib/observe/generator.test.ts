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
});
