import { describe, expect, it } from "vitest";

import { listRunsPayload } from "./api";

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
