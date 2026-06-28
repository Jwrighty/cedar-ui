import { createObserveCorpus } from "./generator";
import { waitForEndpointLatency } from "./latency";

export interface ListRunsOptions {
  cursor?: string | null;
  limit?: number;
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
