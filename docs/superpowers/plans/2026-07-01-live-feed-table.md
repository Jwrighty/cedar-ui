# Live feed table (`/runs`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/runs` "Live feed" surface for `apps/observe` — a dense, sortable TanStack Table into Cedar cells, with URL-encoded filters/sort/time-range, cursor infinite scroll, a designed empty state, SSE live-append, and one optimistic tag mutation with Toast.

**Architecture:** URL is the source of truth for filters/sort/time-range; a react-query `useInfiniteQuery` keys off those params and hits an extended `/api/runs` that filters → sorts → cursor-slices server-side over the seeded deterministic corpus. TanStack Table is presentation + sort-UI only, rendering into Cedar `Table`/`TableRow`/`TableCell`. Phase B layers an SSE endpoint for live-append and a client-optimistic tag mutation.

**Tech Stack:** Next.js App Router (client components + react-query), `@tanstack/react-table` (new dep), `@tanstack/react-query` (already present), `@jwrighty/cedar-react` primitives (`Table`, `StatusPill`, `Skeleton`, `Toast`), MSW + Playwright + Vitest.

## Global Constraints

- Content column width: `width: min(100%, 60rem)` for the feed's primary container; do not widen without a commented reason (PRD page-layout contract).
- Vertical rhythm via semantic space tokens (`var(--semantic-space-stack-*)`); the shared `.dashboard-content` inset owns outer padding — pages must not re-add it.
- No hardcoded `rem`/`px` for the spacing scale — use semantic space tokens only.
- Zero layout shift: every skeleton reserves the exact final dimensions.
- `prefers-reduced-motion`: every animated moment has an instant/cross-fade variant.
- Determinism: seeded generator (`DEFAULT_SEED = 20260224`, `BASE_TIME_MS = Date.parse("2026-02-24T12:00:00.000Z")`); no wall-clock in data logic.
- Test mode: honour `testMode` (`OBSERVE_TEST_MODE=1` or `?testMode=1`) collapsing latencies; MSW handlers pass `testMode: true`.
- axe-clean; native table semantics preserved; app owns the table's `aria-label` and row focus.
- App-only work needs **no changeset**. Only if a change touches `packages/tokens`/`packages/react` add a `.changeset/*.md` per package and run `pnpm changeset:check --since=origin/main`. This plan is app-only by design.
- Run commands from `apps/observe` unless noted. Typecheck: `pnpm --filter observe typecheck`. Unit: `pnpm --filter observe test`. E2E: `pnpm --filter observe test:e2e` (confirm exact script names in `apps/observe/package.json` before first run; substitute if different).

---

## File Structure

**Data layer (server):**
- `apps/observe/src/lib/observe/domain.ts` — MODIFY: add `tags: string[]` to `Run`.
- `apps/observe/src/lib/observe/generator.ts` — MODIFY: seed deterministic `tags`.
- `apps/observe/src/lib/observe/api.ts` — MODIFY: extend `listRunsPayload` (filter/sort), add `runsFacets`, add `appendedRunsSince` (Phase B stream helper), add `applyRunTag`.
- `apps/observe/src/lib/observe/runs-query.ts` — CREATE: shared filter/sort/param types + `parseRunsQuery` (used by route, MSW, hook).
- `apps/observe/src/app/api/runs/route.ts` — MODIFY: parse the new params.
- `apps/observe/src/app/api/runs/facets/route.ts` — CREATE: facets endpoint.
- `apps/observe/src/app/api/runs/stream/route.ts` — CREATE (Phase B): SSE new-run stream.
- `apps/observe/src/app/api/runs/[id]/tags/route.ts` — CREATE (Phase B): tag mutation.
- `apps/observe/src/mocks/handlers.ts` — MODIFY: mirror filter/sort + facets + tags.

**Feed surface (client):**
- `apps/observe/src/app/runs/page.tsx` — CREATE: RSC route wrapper.
- `apps/observe/src/app/runs/live-feed.tsx` — CREATE: client shell.
- `apps/observe/src/app/runs/use-runs-search-params.ts` — CREATE: URL-state hook.
- `apps/observe/src/app/runs/runs-filter-bar.tsx` — CREATE: filters + reset.
- `apps/observe/src/app/runs/runs-table.tsx` — CREATE: TanStack table + infinite scroll + skeleton + empty state.
- `apps/observe/src/app/runs/runs-columns.tsx` — CREATE: column defs + cell formatters.
- `apps/observe/src/app/runs/use-live-runs.ts` — CREATE (Phase B): SSE subscription.
- `apps/observe/src/app/runs/use-tag-run.ts` — CREATE (Phase B): optimistic mutation.
- `apps/observe/src/app/runs/runs-feed.css` — CREATE: feed styles (imported by `live-feed.tsx`).

**Wiring:**
- `apps/observe/src/app/providers.tsx` — MODIFY (Phase B): mount `Toast.Provider` + `Toast.Region`.

**Tests:**
- `apps/observe/src/lib/observe/api.test.ts` — CREATE: filter/sort/cursor + facets + tag unit tests.
- `apps/observe/src/lib/observe/runs-query.test.ts` — CREATE: `parseRunsQuery` tests.
- `apps/observe/tests/live-feed.spec.ts` — CREATE: E2E (URL state, empty reset, infinite scroll).
- `apps/observe/tests/live-feed-tag.spec.ts` — CREATE (Phase B): optimistic tag E2E.

---

# Phase A — issue 07 (the table)

## Task 1: Add `tags` to the domain + seed deterministically

**Files:**
- Modify: `apps/observe/src/lib/observe/domain.ts`
- Modify: `apps/observe/src/lib/observe/generator.ts`
- Test: `apps/observe/src/lib/observe/generator.test.ts` (create if absent; else append)

**Interfaces:**
- Produces: `Run.tags: string[]` (every run has 0–3 tags drawn deterministically from a fixed vocabulary).

- [ ] **Step 1: Write the failing test**

Create/append `apps/observe/src/lib/observe/generator.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createObserveCorpus } from "./generator";

describe("generator tags", () => {
  it("assigns deterministic tags from a fixed vocabulary", () => {
    const a = createObserveCorpus();
    const b = createObserveCorpus();
    expect(a.runs.map((r) => r.tags)).toEqual(b.runs.map((r) => r.tags));

    const vocab = new Set(["regression", "flagged", "customer", "internal", "slow"]);
    for (const run of a.runs) {
      expect(Array.isArray(run.tags)).toBe(true);
      expect(run.tags.length).toBeLessThanOrEqual(3);
      for (const tag of run.tags) expect(vocab.has(tag)).toBe(true);
    }
    // At least some runs are tagged, so the feed's tag UI has data.
    expect(a.runs.some((r) => r.tags.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter observe test -- generator`
Expected: FAIL — `run.tags` is `undefined` (property does not exist on `Run`).

- [ ] **Step 3: Add the field to the domain type**

In `apps/observe/src/lib/observe/domain.ts`, add to `interface Run` (after `sessionId`):

```ts
  sessionId: string;
  tags: string[];
```

- [ ] **Step 4: Seed tags in the generator**

In `apps/observe/src/lib/observe/generator.ts`, add the vocabulary constant near the other constants (after `SPAN_TYPES`):

```ts
const TAG_VOCAB = [
  "regression",
  "flagged",
  "customer",
  "internal",
  "slow",
] as const;
```

Then inside the run-building loop, before `const run: Run = {`, compute tags deterministically from the same `random()` stream:

```ts
    const tagCount = Math.floor(random() * 4) - 1; // -1..2 → biases toward 0
    const tags: string[] = [];
    for (let t = 0; t < Math.max(0, tagCount); t += 1) {
      const tag = pick(TAG_VOCAB, random);
      if (!tags.includes(tag)) tags.push(tag);
    }
```

And add `tags,` to the `run` object literal (after `sessionId`):

```ts
      sessionId: `session_${Math.floor(index / 4) + 1}`,
      tags,
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter observe test -- generator`
Expected: PASS.

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter observe typecheck`
Expected: PASS (no other code depends on `tags` yet; existing `Run` literals are only built in the generator).

- [ ] **Step 7: Commit**

```bash
git add apps/observe/src/lib/observe/domain.ts apps/observe/src/lib/observe/generator.ts apps/observe/src/lib/observe/generator.test.ts
git commit -m "feat(observe): add deterministic tags to Run domain model"
```

---

## Task 2: Shared runs-query parsing (`runs-query.ts`)

**Files:**
- Create: `apps/observe/src/lib/observe/runs-query.ts`
- Test: `apps/observe/src/lib/observe/runs-query.test.ts`

**Interfaces:**
- Produces:
  - `type RunSortField = "time" | "label" | "model" | "status" | "tokens" | "cost" | "latency"`
  - `type SortDir = "asc" | "desc"`
  - `interface RunsQuery { status: RunStatus | null; model: string | null; environment: Environment | null; from: string | null; to: string | null; sortField: RunSortField; sortDir: SortDir }`
  - `const DEFAULT_SORT: { field: RunSortField; dir: SortDir } = { field: "time", dir: "desc" }`
  - `function parseRunsQuery(params: URLSearchParams): RunsQuery`
  - `function serializeSort(field: RunSortField, dir: SortDir): string` → `"field:dir"`

- [ ] **Step 1: Write the failing test**

Create `apps/observe/src/lib/observe/runs-query.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_SORT, parseRunsQuery, serializeSort } from "./runs-query";

describe("parseRunsQuery", () => {
  it("defaults to time:desc with no filters", () => {
    const q = parseRunsQuery(new URLSearchParams());
    expect(q.sortField).toBe("time");
    expect(q.sortDir).toBe("desc");
    expect(q.status).toBeNull();
    expect(q.model).toBeNull();
    expect(q.environment).toBeNull();
  });

  it("reads filters and a valid sort", () => {
    const q = parseRunsQuery(
      new URLSearchParams(
        "status=error&model=o4-mini&env=staging&sort=cost:asc&from=2026-02-24T00:00:00.000Z",
      ),
    );
    expect(q.status).toBe("error");
    expect(q.model).toBe("o4-mini");
    expect(q.environment).toBe("staging");
    expect(q.sortField).toBe("cost");
    expect(q.sortDir).toBe("asc");
    expect(q.from).toBe("2026-02-24T00:00:00.000Z");
  });

  it("rejects invalid enum/sort values, falling back to defaults", () => {
    const q = parseRunsQuery(
      new URLSearchParams("status=nope&env=prod&sort=bogus:sideways"),
    );
    expect(q.status).toBeNull();
    expect(q.environment).toBeNull();
    expect(q.sortField).toBe(DEFAULT_SORT.field);
    expect(q.sortDir).toBe(DEFAULT_SORT.dir);
  });

  it("serializeSort round-trips", () => {
    expect(serializeSort("latency", "asc")).toBe("latency:asc");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter observe test -- runs-query`
Expected: FAIL — module `./runs-query` not found.

- [ ] **Step 3: Implement `runs-query.ts`**

Create `apps/observe/src/lib/observe/runs-query.ts`:

```ts
import type { Environment, RunStatus } from "./domain";

export type RunSortField =
  | "time"
  | "label"
  | "model"
  | "status"
  | "tokens"
  | "cost"
  | "latency";

export type SortDir = "asc" | "desc";

export interface RunsQuery {
  status: RunStatus | null;
  model: string | null;
  environment: Environment | null;
  from: string | null;
  to: string | null;
  sortField: RunSortField;
  sortDir: SortDir;
}

export const DEFAULT_SORT: { field: RunSortField; dir: SortDir } = {
  field: "time",
  dir: "desc",
};

const SORT_FIELDS: RunSortField[] = [
  "time",
  "label",
  "model",
  "status",
  "tokens",
  "cost",
  "latency",
];
const STATUSES: RunStatus[] = ["running", "success", "error"];
const ENVIRONMENTS: Environment[] = ["production", "staging"];

function oneOf<T extends string>(value: string | null, allowed: T[]): T | null {
  return value !== null && (allowed as string[]).includes(value)
    ? (value as T)
    : null;
}

export function serializeSort(field: RunSortField, dir: SortDir): string {
  return `${field}:${dir}`;
}

export function parseRunsQuery(params: URLSearchParams): RunsQuery {
  const [rawField, rawDir] = (params.get("sort") ?? "").split(":");
  const sortField = oneOf<RunSortField>(rawField ?? null, SORT_FIELDS) ?? DEFAULT_SORT.field;
  const sortDir: SortDir = rawDir === "asc" || rawDir === "desc" ? rawDir : DEFAULT_SORT.dir;

  return {
    status: oneOf<RunStatus>(params.get("status"), STATUSES),
    model: params.get("model"),
    environment: oneOf<Environment>(params.get("env"), ENVIRONMENTS),
    from: params.get("from"),
    to: params.get("to"),
    sortField,
    sortDir,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter observe test -- runs-query`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/observe/src/lib/observe/runs-query.ts apps/observe/src/lib/observe/runs-query.test.ts
git commit -m "feat(observe): shared runs-query param parsing"
```

---

## Task 3: Server-side filter/sort in `listRunsPayload` + `runsFacets`

**Files:**
- Modify: `apps/observe/src/lib/observe/api.ts`
- Test: `apps/observe/src/lib/observe/api.test.ts`

**Interfaces:**
- Consumes: `RunsQuery`, `DEFAULT_SORT` from `./runs-query`.
- Produces:
  - `ListRunsOptions` extended with `status?`, `model?`, `environment?`, `from?`, `to?`, `sortField?`, `sortDir?`.
  - `listRunsPayload(...)` return unchanged shape `{ runs: Run[]; nextCursor: string | null; generatedAt: string }` but now filtered + sorted before cursor-slicing.
  - `runsFacets(): { models: string[]; environments: Environment[]; referenceTime: string }` — distinct models/environments + the newest run's `startedAt` (for time-range presets).

- [ ] **Step 1: Write the failing tests**

Create `apps/observe/src/lib/observe/api.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { listRunsPayload, runsFacets } from "./api";

describe("listRunsPayload filtering + sorting", () => {
  it("filters by status", async () => {
    const { runs } = await listRunsPayload({ status: "error", limit: 100, testMode: true });
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
    expect(runs.every((r) => r.model === "o4-mini" && r.environment === "staging")).toBe(true);
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
    const first = await listRunsPayload({ status: "success", limit: 10, testMode: true });
    expect(first.nextCursor).not.toBeNull();
    const second = await listRunsPayload({
      status: "success",
      cursor: first.nextCursor,
      limit: 10,
      testMode: true,
    });
    const overlap = first.runs.filter((r) => second.runs.some((s) => s.id === r.id));
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
    const from = new Date(Date.parse(facets.referenceTime) - 60 * 60 * 1000).toISOString();
    const { runs } = await listRunsPayload({ from, limit: 100, testMode: true });
    expect(runs.every((r) => Date.parse(r.startedAt) >= Date.parse(from))).toBe(true);
  });
});

describe("runsFacets", () => {
  it("returns distinct models, environments, and a reference time", () => {
    const facets = runsFacets();
    expect(facets.models.length).toBeGreaterThan(1);
    expect(new Set(facets.models).size).toBe(facets.models.length);
    expect(facets.environments).toEqual(expect.arrayContaining(["production", "staging"]));
    expect(Number.isNaN(Date.parse(facets.referenceTime))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter observe test -- api`
Expected: FAIL — `runsFacets` not exported; `listRunsPayload` ignores the new options.

- [ ] **Step 3: Extend `ListRunsOptions` and `listRunsPayload`**

In `apps/observe/src/lib/observe/api.ts`, add imports at the top (alongside existing imports):

```ts
import type { Environment, RunStatus } from "./domain";
import type { RunSortField, SortDir } from "./runs-query";
import { DEFAULT_SORT } from "./runs-query";
```

Extend the interface:

```ts
export interface ListRunsOptions {
  cursor?: string | null;
  limit?: number;
  status?: RunStatus | null;
  model?: string | null;
  environment?: Environment | null;
  from?: string | null;
  to?: string | null;
  sortField?: RunSortField;
  sortDir?: SortDir;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}
```

Replace the body of `listRunsPayload` (keep the `waitForEndpointLatency` call) with:

```ts
export async function listRunsPayload({
  cursor,
  limit = 10,
  status = null,
  model = null,
  environment = null,
  from = null,
  to = null,
  sortField = DEFAULT_SORT.field,
  sortDir = DEFAULT_SORT.dir,
  testMode,
  slowMoMultiplier,
}: ListRunsOptions = {}) {
  await waitForEndpointLatency({ endpoint: "runs", testMode, slowMoMultiplier });

  const start = Number(cursor ?? 0);
  const safeStart = Number.isFinite(start) && start > 0 ? start : 0;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;

  const fromMs = from ? Date.parse(from) : null;
  const toMs = to ? Date.parse(to) : null;

  const filtered = createObserveCorpus().runs.filter((run) => {
    if (status && run.status !== status) return false;
    if (model && run.model !== model) return false;
    if (environment && run.environment !== environment) return false;
    const startedMs = Date.parse(run.startedAt);
    if (fromMs !== null && startedMs < fromMs) return false;
    if (toMs !== null && startedMs > toMs) return false;
    return true;
  });

  const sorted = sortRuns(filtered, sortField, sortDir);
  const page = sorted.slice(safeStart, safeStart + safeLimit);
  const nextCursor =
    safeStart + page.length < sorted.length
      ? String(safeStart + page.length)
      : null;

  return {
    runs: page,
    nextCursor,
    generatedAt: new Date("2026-02-24T12:00:00.000Z").toISOString(),
  };
}
```

- [ ] **Step 4: Add the `sortRuns` helper and `runsFacets`**

Add near the other private helpers at the bottom of `api.ts`:

```ts
function sortValue(run: Run, field: RunSortField): number | string {
  switch (field) {
    case "time":
      return Date.parse(run.startedAt);
    case "label":
      return run.label;
    case "model":
      return run.model;
    case "status":
      return run.status;
    case "tokens":
      return run.tokensIn + run.tokensOut;
    case "cost":
      return run.costUsd;
    case "latency":
      return run.durationMs ?? -1; // running runs sort as lowest latency
  }
}

function sortRuns(runs: Run[], field: RunSortField, dir: SortDir): Run[] {
  const factor = dir === "asc" ? 1 : -1;
  // Stable sort with id as a deterministic tie-breaker.
  return [...runs].sort((a, b) => {
    const av = sortValue(a, field);
    const bv = sortValue(b, field);
    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv));
    if (cmp !== 0) return cmp * factor;
    return a.id.localeCompare(b.id) * factor;
  });
}

export function runsFacets(): {
  models: string[];
  environments: Environment[];
  referenceTime: string;
} {
  const runs = createObserveCorpus().runs;
  const models = Array.from(new Set(runs.map((r) => r.model))).sort();
  const environments = Array.from(
    new Set(runs.map((r) => r.environment)),
  ) as Environment[];
  const referenceTime = runs.reduce(
    (latest, r) => (Date.parse(r.startedAt) > Date.parse(latest) ? r.startedAt : latest),
    runs[0]!.startedAt,
  );
  return { models, environments: environments.sort(), referenceTime };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter observe test -- api`
Expected: PASS (all cases).

- [ ] **Step 6: Typecheck + full unit run**

Run: `pnpm --filter observe typecheck && pnpm --filter observe test`
Expected: PASS. Note: the Overview still calls `listRunsPayload`/`overviewRecentRunsPayload` — verify Overview tests still pass (default sort is now time:desc; `overviewRecentRunsPayload` still slices `corpus.runs` directly and is unaffected).

- [ ] **Step 7: Commit**

```bash
git add apps/observe/src/lib/observe/api.ts apps/observe/src/lib/observe/api.test.ts
git commit -m "feat(observe): server-side runs filtering, sorting, and facets"
```

---

## Task 4: Wire the API route, facets route, and MSW handler

**Files:**
- Modify: `apps/observe/src/app/api/runs/route.ts`
- Create: `apps/observe/src/app/api/runs/facets/route.ts`
- Modify: `apps/observe/src/mocks/handlers.ts`

**Interfaces:**
- Consumes: `parseRunsQuery` (`runs-query.ts`), `listRunsPayload`, `runsFacets`.
- Produces: `GET /api/runs?status&model&env&from&to&sort&cursor&limit`; `GET /api/runs/facets`.

- [ ] **Step 1: Update the runs route to parse new params**

Replace `apps/observe/src/app/api/runs/route.ts` with:

```ts
import { NextResponse } from "next/server";

import { listRunsPayload } from "@/lib/observe/api";
import {
  isObserveTestMode,
  parseSlowMoMultiplier,
} from "@/lib/observe/latency";
import { parseRunsQuery } from "@/lib/observe/runs-query";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = parseRunsQuery(url.searchParams);
  const payload = await listRunsPayload({
    cursor: url.searchParams.get("cursor"),
    limit: Number(url.searchParams.get("limit") ?? 10),
    status: query.status,
    model: query.model,
    environment: query.environment,
    from: query.from,
    to: query.to,
    sortField: query.sortField,
    sortDir: query.sortDir,
    testMode: url.searchParams.get("testMode") === "1" || isObserveTestMode(),
    slowMoMultiplier: parseSlowMoMultiplier(url.searchParams.get("slowMo")),
  });

  return NextResponse.json(payload);
}
```

- [ ] **Step 2: Create the facets route**

Create `apps/observe/src/app/api/runs/facets/route.ts`:

```ts
import { NextResponse } from "next/server";

import { runsFacets } from "@/lib/observe/api";

export function GET() {
  return NextResponse.json(runsFacets());
}
```

- [ ] **Step 3: Update the MSW handler to mirror**

Replace `apps/observe/src/mocks/handlers.ts` with:

```ts
import { http, HttpResponse, delay } from "msw";

import { listRunsPayload, runsFacets } from "@/lib/observe/api";
import { parseRunsQuery } from "@/lib/observe/runs-query";

export const handlers = [
  http.get("*/api/runs/facets", async () => {
    await delay(1);
    return HttpResponse.json(runsFacets());
  }),
  http.get("*/api/runs", async ({ request }) => {
    const url = new URL(request.url);
    const query = parseRunsQuery(url.searchParams);
    const payload = await listRunsPayload({
      cursor: url.searchParams.get("cursor"),
      limit: Number(url.searchParams.get("limit") ?? 10),
      status: query.status,
      model: query.model,
      environment: query.environment,
      from: query.from,
      to: query.to,
      sortField: query.sortField,
      sortDir: query.sortDir,
      testMode: true,
    });

    await delay(1);
    return HttpResponse.json(payload);
  }),
];
```

Note: register `*/api/runs/facets` **before** `*/api/runs` (MSW matches most-specific-first, but explicit ordering avoids the `/facets` request being swallowed by the broader matcher).

- [ ] **Step 4: Verify the route compiles and responds**

Run: `pnpm --filter observe typecheck`
Expected: PASS.

Then start the dev server and check both endpoints:

Run: `pnpm --filter observe dev` (background), then:
`curl -s 'http://localhost:3010/api/runs?status=error&limit=3' | head -c 400`
`curl -s 'http://localhost:3010/api/runs/facets'`
Expected: JSON with only `error` runs; facets with `models`, `environments`, `referenceTime`. (Confirm the dev port from `apps/observe/package.json`/`next.config`; substitute if not 3010.)

- [ ] **Step 5: Commit**

```bash
git add apps/observe/src/app/api/runs/route.ts apps/observe/src/app/api/runs/facets/route.ts apps/observe/src/mocks/handlers.ts
git commit -m "feat(observe): wire runs filter/sort params and facets endpoint"
```

---

## Task 5: Install TanStack Table + URL-state hook (`use-runs-search-params.ts`)

**Files:**
- Modify: `apps/observe/package.json` (add `@tanstack/react-table`)
- Create: `apps/observe/src/app/runs/use-runs-search-params.ts`

**Interfaces:**
- Consumes: `RunsQuery`, `RunSortField`, `SortDir`, `DEFAULT_SORT`, `serializeSort` (`runs-query.ts`).
- Produces:
  - `interface RunsFilters { status: RunStatus | null; model: string | null; environment: Environment | null; from: string | null; to: string | null }`
  - `useRunsSearchParams()` → `{ query: RunsQuery; filters: RunsFilters; setFilter(key, value): void; toggleSort(field): void; reset(): void; hasActiveFilters: boolean }`
  - `runsQueryString(query: RunsQuery): string` — canonical query string used as the react-query key + fetch URL (omits defaults).

- [ ] **Step 1: Install the dependency**

Run: `pnpm --filter observe add @tanstack/react-table`
Expected: `@tanstack/react-table` added to `apps/observe/package.json` dependencies.

- [ ] **Step 2: Implement the hook**

Create `apps/observe/src/app/runs/use-runs-search-params.ts`:

```ts
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import type { Environment, RunStatus } from "@/lib/observe/domain";
import {
  DEFAULT_SORT,
  parseRunsQuery,
  serializeSort,
  type RunSortField,
  type RunsQuery,
  type SortDir,
} from "@/lib/observe/runs-query";

export interface RunsFilters {
  status: RunStatus | null;
  model: string | null;
  environment: Environment | null;
  from: string | null;
  to: string | null;
}

const FILTER_TO_PARAM: Record<keyof RunsFilters, string> = {
  status: "status",
  model: "model",
  environment: "env",
  from: "from",
  to: "to",
};

/** Canonical query string for fetch URL + react-query key. Omits defaults. */
export function runsQueryString(query: RunsQuery): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.model) params.set("model", query.model);
  if (query.environment) params.set("env", query.environment);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (
    query.sortField !== DEFAULT_SORT.field ||
    query.sortDir !== DEFAULT_SORT.dir
  ) {
    params.set("sort", serializeSort(query.sortField, query.sortDir));
  }
  return params.toString();
}

export function useRunsSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const query = useMemo(
    () => parseRunsQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const push = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    (key: keyof RunsFilters, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      const param = FILTER_TO_PARAM[key];
      if (value === null || value === "") next.delete(param);
      else next.set(param, value);
      push(next);
    },
    [push, searchParams],
  );

  const toggleSort = useCallback(
    (field: RunSortField) => {
      const next = new URLSearchParams(searchParams.toString());
      // First click on a new field → desc; clicking the active field flips dir.
      const dir: SortDir =
        query.sortField === field && query.sortDir === "desc" ? "asc" : "desc";
      if (field === DEFAULT_SORT.field && dir === DEFAULT_SORT.dir) {
        next.delete("sort");
      } else {
        next.set("sort", serializeSort(field, dir));
      }
      push(next);
    },
    [push, query.sortDir, query.sortField, searchParams],
  );

  const reset = useCallback(() => {
    startTransition(() => router.push(pathname));
  }, [pathname, router]);

  const filters: RunsFilters = {
    status: query.status,
    model: query.model,
    environment: query.environment,
    from: query.from,
    to: query.to,
  };

  const hasActiveFilters =
    filters.status !== null ||
    filters.model !== null ||
    filters.environment !== null ||
    filters.from !== null ||
    filters.to !== null;

  return { query, filters, setFilter, toggleSort, reset, hasActiveFilters };
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter observe typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/observe/package.json ../../pnpm-lock.yaml apps/observe/src/app/runs/use-runs-search-params.ts
git commit -m "feat(observe): add tanstack table dep and runs URL-state hook"
```

(If the lockfile lives elsewhere, `git add` the repo-root `pnpm-lock.yaml` that changed.)

---

## Task 6: Column defs + cell formatters (`runs-columns.tsx`)

**Files:**
- Create: `apps/observe/src/app/runs/runs-columns.tsx`

**Interfaces:**
- Consumes: `Run` (`domain.ts`), `RunSortField` (`runs-query.ts`).
- Produces:
  - `interface RunColumn { id: RunSortField; header: string; isNumeric: boolean; cell(run: Run): ReactNode }`
  - `const RUN_COLUMNS: RunColumn[]` — ordered time / label / model / status / tokens / cost / latency.
  - Exported formatters reused by tests: `formatTime`, `formatTokens`, `formatCost`, `formatLatency`.

This task uses a plain typed column array (not `createColumnHelper`) because rows render into Cedar `TableCell` elements, not TanStack's default renderer — TanStack owns only header/sort state, which keys off `RunSortField`. This keeps the table presentational per ADR-0006.

- [ ] **Step 1: Implement the columns**

Create `apps/observe/src/app/runs/runs-columns.tsx`:

```tsx
import type { ReactNode } from "react";

import { StatusPill } from "@jwrighty/cedar-react";

import type { Run } from "@/lib/observe/domain";
import type { RunSortField } from "@/lib/observe/runs-query";

export interface RunColumn {
  id: RunSortField;
  header: string;
  isNumeric: boolean;
  cell: (run: Run) => ReactNode;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatTokens(run: Run): string {
  return new Intl.NumberFormat("en-US").format(run.tokensIn + run.tokensOut);
}

export function formatCost(costUsd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(costUsd);
}

export function formatLatency(durationMs: Run["durationMs"]): string {
  if (durationMs === null) return "—";
  return durationMs >= 1000
    ? `${(durationMs / 1000).toFixed(1)}s`
    : `${durationMs}ms`;
}

function statusLabel(status: Run["status"]): string {
  return status[0]!.toUpperCase() + status.slice(1);
}

export const RUN_COLUMNS: RunColumn[] = [
  { id: "time", header: "Time", isNumeric: false, cell: (r) => formatTime(r.startedAt) },
  { id: "label", header: "Run", isNumeric: false, cell: (r) => r.label },
  { id: "model", header: "Model", isNumeric: false, cell: (r) => r.model },
  {
    id: "status",
    header: "Status",
    isNumeric: false,
    cell: (r) => (
      <StatusPill status={r.status} size="sm">
        {statusLabel(r.status)}
      </StatusPill>
    ),
  },
  { id: "tokens", header: "Tokens", isNumeric: true, cell: (r) => formatTokens(r) },
  { id: "cost", header: "Cost", isNumeric: true, cell: (r) => formatCost(r.costUsd) },
  { id: "latency", header: "Latency", isNumeric: true, cell: (r) => formatLatency(r.durationMs) },
];
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter observe typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/observe/src/app/runs/runs-columns.tsx
git commit -m "feat(observe): runs table column defs and formatters"
```

---

## Task 7: The table with infinite scroll, skeleton, and empty state (`runs-table.tsx`)

**Files:**
- Create: `apps/observe/src/app/runs/runs-table.tsx`
- Create: `apps/observe/src/app/runs/runs-feed.css`

**Interfaces:**
- Consumes: `RUN_COLUMNS` (`runs-columns.tsx`), `useRunsSearchParams`, `runsQueryString`, Cedar `Table`/`TableRow`/`TableCell`/`TableHeaderCell`/`Skeleton`/`Button`/`Heading`/`Text`.
- Produces: `RunsTable({ testMode }: { testMode?: boolean })` default-exported-as-named client component; a `RunsPage` payload type mirroring `listRunsPayload`'s return.

- [ ] **Step 1: Implement the table**

Create `apps/observe/src/app/runs/runs-table.tsx`:

```tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  Button,
  Heading,
  Skeleton,
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  Text,
} from "@jwrighty/cedar-react";

import type { Run } from "@/lib/observe/domain";
import { RUN_COLUMNS } from "./runs-columns";
import {
  runsQueryString,
  useRunsSearchParams,
} from "./use-runs-search-params";

interface RunsPage {
  runs: Run[];
  nextCursor: string | null;
  generatedAt: string;
}

const PAGE_SIZE = 25;

async function fetchRunsPage(
  qs: string,
  cursor: string | null,
): Promise<RunsPage> {
  const params = new URLSearchParams(qs);
  params.set("limit", String(PAGE_SIZE));
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/runs?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load runs (${res.status})`);
  return res.json();
}

export function RunsTable() {
  const router = useRouter();
  const { query, toggleSort, reset, hasActiveFilters } = useRunsSearchParams();
  const qs = runsQueryString(query);

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["runs", qs],
    queryFn: ({ pageParam }) => fetchRunsPage(qs, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const runs = data?.pages.flatMap((p) => p.runs) ?? [];

  // Infinite-scroll sentinel.
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, runs.length]);

  function openRun(id: string) {
    router.push(`/runs/${id}`);
  }

  return (
    <div className="runs-table-wrap" data-testid="runs-table">
      <Table density="compact" aria-label="Runs">
        <thead>
          <TableRow>
            {RUN_COLUMNS.map((col) => {
              const active = query.sortField === col.id;
              return (
                <TableHeaderCell
                  key={col.id}
                  scope="col"
                  isNumeric={col.isNumeric}
                  align={col.isNumeric ? "end" : "start"}
                  aria-sort={
                    active ? (query.sortDir === "asc" ? "ascending" : "descending") : "none"
                  }
                >
                  <button
                    type="button"
                    className="runs-sort-button"
                    data-active={active || undefined}
                    onClick={() => toggleSort(col.id)}
                  >
                    {col.header}
                    <span aria-hidden="true" className="runs-sort-indicator">
                      {active ? (query.sortDir === "asc" ? "↑" : "↓") : ""}
                    </span>
                  </button>
                </TableHeaderCell>
              );
            })}
          </TableRow>
        </thead>
        <tbody>
          {isPending
            ? Array.from({ length: 10 }, (_, i) => (
                <TableRow key={`sk-${i}`} aria-hidden="true">
                  {RUN_COLUMNS.map((col) => (
                    <TableCell key={col.id} isNumeric={col.isNumeric} align={col.isNumeric ? "end" : "start"}>
                      <Skeleton shape="text" className="runs-skeleton-cell" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : runs.map((run) => (
                <TableRow
                  key={run.id}
                  isInteractive
                  data-status={run.status}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open trace for ${run.label}`}
                  className="runs-row runs-row--enter"
                  onClick={() => openRun(run.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openRun(run.id);
                    }
                  }}
                >
                  {RUN_COLUMNS.map((col) => (
                    <TableCell key={col.id} isNumeric={col.isNumeric} align={col.isNumeric ? "end" : "start"}>
                      {col.cell(run)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          {hasNextPage ? <tr ref={sentinelRef} aria-hidden="true" /> : null}
        </tbody>
      </Table>

      {!isPending && !isError && runs.length === 0 ? (
        <div className="runs-empty" data-testid="runs-empty" role="status">
          <Heading level={2} size="sm">No runs match these filters</Heading>
          <Text tone="muted">
            Try widening the time range or clearing a filter to see more activity.
          </Text>
          {hasActiveFilters ? (
            <Button variant="secondary" onClick={reset}>Reset filters</Button>
          ) : null}
        </div>
      ) : null}

      {isError ? (
        <div className="runs-error" data-testid="runs-error" role="alert">
          <Text tone="muted">Could not load runs.</Text>
          <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : null}
    </div>
  );
}
```

Note on Cedar prop names: `Button variant` and `Text tone` are assumed from house conventions — before running, confirm the exact prop names/values in `packages/react/src/Button.tsx` and `Text.tsx` and substitute if they differ (e.g. `variant="secondary"` vs `variant="neutral"`).

- [ ] **Step 2: Add the feed CSS**

Create `apps/observe/src/app/runs/runs-feed.css`:

```css
.runs-feed {
  width: min(100%, 60rem);
  display: flex;
  flex-direction: column;
  gap: var(--semantic-space-stack-xl);
}

.runs-table-wrap {
  position: relative;
  overflow-x: auto;
}

.runs-sort-button {
  display: inline-flex;
  align-items: center;
  gap: var(--semantic-space-inline-xs);
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.runs-sort-button[data-active] {
  font-weight: 600;
}

.runs-skeleton-cell {
  width: 100%;
  max-width: 8rem;
}

.runs-row {
  animation: runs-row-enter var(--semantic-motion-duration-fast, 160ms)
    var(--semantic-motion-easing-standard, ease) both;
}

@keyframes runs-row-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

.runs-empty,
.runs-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--semantic-space-stack-md);
  padding: var(--semantic-space-stack-xl) 0;
}

@media (prefers-reduced-motion: reduce) {
  .runs-row { animation: none; }
}
```

Note: confirm the exact motion/space token names against `packages/tokens` output; the `var(--…, fallback)` forms degrade gracefully if a token name differs, but prefer the real token names — grep `packages/tokens` for `--semantic-space-stack` and `--semantic-motion-duration` and correct if needed.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter observe typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/observe/src/app/runs/runs-table.tsx apps/observe/src/app/runs/runs-feed.css
git commit -m "feat(observe): runs table with infinite scroll, skeleton, empty state"
```

---

## Task 8: Filter bar (`runs-filter-bar.tsx`)

**Files:**
- Create: `apps/observe/src/app/runs/runs-filter-bar.tsx`

**Interfaces:**
- Consumes: `useRunsSearchParams`, `useQuery` for `/api/runs/facets`, Cedar `Button`.
- Produces: `RunsFilterBar()` client component.

- [ ] **Step 1: Implement the filter bar**

Create `apps/observe/src/app/runs/runs-filter-bar.tsx`:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@jwrighty/cedar-react";

import type { Environment } from "@/lib/observe/domain";
import { useRunsSearchParams } from "./use-runs-search-params";

interface Facets {
  models: string[];
  environments: Environment[];
  referenceTime: string;
}

const STATUS_OPTIONS = ["running", "success", "error"] as const;
const RANGE_PRESETS: { label: string; hours: number | null }[] = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "All", hours: null },
];

export function RunsFilterBar() {
  const { filters, setFilter, reset, hasActiveFilters } = useRunsSearchParams();
  const { data: facets } = useQuery<Facets>({
    queryKey: ["runs-facets"],
    queryFn: async () => {
      const res = await fetch("/api/runs/facets");
      if (!res.ok) throw new Error("facets");
      return res.json();
    },
  });

  function applyRange(hours: number | null) {
    if (hours === null || !facets) {
      setFilter("from", null);
      return;
    }
    const from = new Date(
      Date.parse(facets.referenceTime) - hours * 60 * 60 * 1000,
    ).toISOString();
    setFilter("from", from);
  }

  return (
    <div className="runs-filter-bar" data-testid="runs-filter-bar">
      <label className="runs-filter">
        <span className="runs-filter__label">Status</span>
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilter("status", e.target.value || null)}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s[0]!.toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </label>

      <label className="runs-filter">
        <span className="runs-filter__label">Model</span>
        <select
          value={filters.model ?? ""}
          onChange={(e) => setFilter("model", e.target.value || null)}
        >
          <option value="">All</option>
          {(facets?.models ?? []).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>

      <label className="runs-filter">
        <span className="runs-filter__label">Environment</span>
        <select
          value={filters.environment ?? ""}
          onChange={(e) => setFilter("environment", e.target.value || null)}
        >
          <option value="">All</option>
          {(facets?.environments ?? []).map((env) => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>
      </label>

      <div className="runs-filter" role="group" aria-label="Time range">
        <span className="runs-filter__label">Range</span>
        <div className="runs-range">
          {RANGE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="runs-range__btn"
              onClick={() => applyRange(preset.hours)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters ? (
        <Button variant="secondary" onClick={reset}>Reset</Button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Add filter-bar CSS**

Append to `apps/observe/src/app/runs/runs-feed.css`:

```css
.runs-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--semantic-space-inline-md);
}

.runs-filter {
  display: flex;
  flex-direction: column;
  gap: var(--semantic-space-stack-xs);
}

.runs-filter__label {
  font-size: 0.75rem;
  color: var(--semantic-color-text-muted, inherit);
}

.runs-range {
  display: inline-flex;
  gap: var(--semantic-space-inline-xs);
}
```

(Confirm `--semantic-color-text-muted` exists; substitute the real muted-text token or drop the rule.)

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter observe typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/observe/src/app/runs/runs-filter-bar.tsx apps/observe/src/app/runs/runs-feed.css
git commit -m "feat(observe): runs filter bar with facets and time-range presets"
```

---

## Task 9: The route + client shell (`page.tsx`, `live-feed.tsx`)

**Files:**
- Create: `apps/observe/src/app/runs/live-feed.tsx`
- Create: `apps/observe/src/app/runs/page.tsx`

**Interfaces:**
- Consumes: `DashboardShell`, `RunsFilterBar`, `RunsTable`.
- Produces: the `/runs` page.

- [ ] **Step 1: Implement the client shell**

Create `apps/observe/src/app/runs/live-feed.tsx`:

```tsx
"use client";

import { Suspense } from "react";

import { Heading } from "@jwrighty/cedar-react";

import { RunsFilterBar } from "./runs-filter-bar";
import { RunsTable } from "./runs-table";
import "./runs-feed.css";

export function LiveFeed() {
  return (
    <section className="runs-feed" aria-labelledby="runs-feed-title">
      <Heading id="runs-feed-title" level={1} size="md">Live feed</Heading>
      {/* useSearchParams requires a Suspense boundary in the App Router. */}
      <Suspense>
        <RunsFilterBar />
        <RunsTable />
      </Suspense>
    </section>
  );
}
```

- [ ] **Step 2: Implement the route**

Create `apps/observe/src/app/runs/page.tsx`:

```tsx
import { DashboardShell } from "../dashboard-shell";
import { LiveFeed } from "./live-feed";

export default function RunsPage() {
  return (
    <DashboardShell>
      <LiveFeed />
    </DashboardShell>
  );
}
```

Note: confirm how existing pages mount `DashboardShell` (check `apps/observe/src/app/page.tsx`) — match that exact pattern (import path, whether the shell wraps or is a layout). If `DashboardShell` is applied via a `layout.tsx`, drop the wrapper here and render `<LiveFeed />` alone.

- [ ] **Step 3: Verify in the browser (preview tools)**

Start the dev server and open `/runs`. Confirm: skeleton rows appear then fade to data; headers sort (URL `?sort=` updates); selecting Status=error filters and updates the URL; browser back restores the prior view; scrolling loads more rows.

- [ ] **Step 4: Typecheck + build**

Run: `pnpm --filter observe typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/observe/src/app/runs/live-feed.tsx apps/observe/src/app/runs/page.tsx
git commit -m "feat(observe): /runs live feed route and client shell"
```

---

## Task 10: E2E — URL state, empty reset, infinite scroll

**Files:**
- Create: `apps/observe/tests/live-feed.spec.ts`

**Interfaces:**
- Consumes: the running app (Playwright drives the real UI over MSW/route handlers in test mode).

- [ ] **Step 1: Write the E2E spec**

Create `apps/observe/tests/live-feed.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("filters and sort are reconstructable from the URL", async ({ page }) => {
  await page.goto("/runs");
  await expect(page.getByTestId("runs-table")).toBeVisible();

  // Filter to error status.
  await page.getByTestId("runs-filter-bar").getByLabel("Status").selectOption("error");
  await expect(page).toHaveURL(/status=error/);

  // Sort by cost (click the Cost header button twice → asc).
  const costHeader = page.getByRole("columnheader", { name: /Cost/ }).getByRole("button");
  await costHeader.click();
  await expect(page).toHaveURL(/sort=cost%3Adesc|sort=cost:desc/);

  // Reload reconstructs the same view.
  await page.reload();
  await expect(page).toHaveURL(/status=error/);
  await expect(page.getByLabel("Status")).toHaveValue("error");

  // Back button restores prior state.
  await page.goBack();
  await expect(page).not.toHaveURL(/sort=cost/);
});

test("empty state appears for an impossible filter and resets", async ({ page }) => {
  // Deep-link straight to a filter that matches nothing.
  await page.goto("/runs?status=error&model=does-not-exist");
  await expect(page.getByTestId("runs-empty")).toBeVisible();
  await page.getByRole("button", { name: /Reset/ }).first().click();
  await expect(page).toHaveURL(/\/runs$/);
  await expect(page.getByTestId("runs-empty")).toHaveCount(0);
});

test("infinite scroll loads additional rows", async ({ page }) => {
  await page.goto("/runs");
  const rows = page.getByTestId("runs-table").getByRole("link");
  await expect(rows.first()).toBeVisible();
  const initial = await rows.count();
  await page.mouse.wheel(0, 20000);
  await expect(async () => {
    expect(await rows.count()).toBeGreaterThan(initial);
  }).toPass();
});
```

Note: adjust selectors to match final DOM (e.g. if `getByLabel("Status")` is ambiguous, scope within `getByTestId("runs-filter-bar")`). Confirm the Playwright base URL/port and test-mode env in `apps/observe/playwright.config.ts`.

- [ ] **Step 2: Run the E2E suite**

Run: `pnpm --filter observe test:e2e -- live-feed`
Expected: 3 tests PASS. (Confirm the exact e2e script name; substitute if different.)

- [ ] **Step 3: axe check**

Add an axe assertion following the existing pattern in `apps/observe/tests/smoke.spec.ts` (inject `axe-core`, assert zero violations on `/runs`). If the smoke test uses a shared helper, reuse it. Run the suite again; expected: PASS, zero violations.

- [ ] **Step 4: Commit**

```bash
git add apps/observe/tests/live-feed.spec.ts
git commit -m "test(observe): e2e for live-feed url state, empty reset, infinite scroll"
```

---

# Phase B — issue 08 (realtime + optimistic mutation)

## Task 11: SSE live-append endpoint + subscription

**Files:**
- Modify: `apps/observe/src/lib/observe/api.ts` (add `appendedRuns`)
- Create: `apps/observe/src/app/api/runs/stream/route.ts`
- Create: `apps/observe/src/app/runs/use-live-runs.ts`
- Modify: `apps/observe/src/app/runs/runs-table.tsx` (merge live runs at top)

**Interfaces:**
- Produces:
  - `appendedRuns(count: number): Run[]` — deterministic synthetic runs with ids `run_appended_0001…`, `status: "running"→` a settled status, `startedAt` just after `referenceTime`, so they sort to the top of the default view.
  - `GET /api/runs/stream` (SSE) emitting `data: <Run JSON>\n\n` every interval; interval collapses in test mode.
  - `useLiveRuns({ enabled }): Run[]` — client hook subscribing via `EventSource`, returning newest-first accumulated live runs.

- [ ] **Step 1: Add `appendedRuns` with a determinism test**

In `api.ts`, add:

```ts
export function appendedRuns(count: number): Run[] {
  const facets = runsFacets();
  const baseMs = Date.parse(facets.referenceTime);
  const corpus = createObserveCorpus();
  const template = corpus.runs;
  return Array.from({ length: count }, (_, i) => {
    const source = template[i % template.length]!;
    return {
      ...source,
      id: `run_appended_${String(i + 1).padStart(4, "0")}`,
      label: `${source.agentName} #${String(9000 + i)}`,
      status: "success",
      startedAt: new Date(baseMs + (i + 1) * 1000).toISOString(),
      tags: [],
    };
  });
}
```

Append to `api.test.ts`:

```ts
import { appendedRuns } from "./api";

describe("appendedRuns", () => {
  it("is deterministic and sorts after the reference time", () => {
    expect(appendedRuns(3)).toEqual(appendedRuns(3));
    const facets = runsFacets();
    for (const run of appendedRuns(3)) {
      expect(Date.parse(run.startedAt)).toBeGreaterThan(Date.parse(facets.referenceTime));
      expect(run.id).toMatch(/^run_appended_/);
    }
  });
});
```

Run: `pnpm --filter observe test -- api`
Expected: PASS.

- [ ] **Step 2: Create the SSE route**

Create `apps/observe/src/app/api/runs/stream/route.ts`:

```ts
import { appendedRuns } from "@/lib/observe/api";
import { isObserveTestMode } from "@/lib/observe/latency";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const testMode =
    new URL(request.url).searchParams.get("testMode") === "1" || isObserveTestMode();
  const intervalMs = testMode ? 150 : 4000;
  const runs = appendedRuns(12);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let i = 0;
      const timer = setInterval(() => {
        if (i >= runs.length) {
          clearInterval(timer);
          controller.close();
          return;
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(runs[i])}\n\n`),
        );
        i += 1;
      }, intervalMs);

      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 3: Create the subscription hook**

Create `apps/observe/src/app/runs/use-live-runs.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

import type { Run } from "@/lib/observe/domain";

export function useLiveRuns({ enabled }: { enabled: boolean }): Run[] {
  const [liveRuns, setLiveRuns] = useState<Run[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource("/api/runs/stream");
    source.onmessage = (event) => {
      const run = JSON.parse(event.data) as Run;
      setLiveRuns((prev) =>
        prev.some((r) => r.id === run.id) ? prev : [run, ...prev],
      );
    };
    source.onerror = () => source.close();
    return () => source.close();
  }, [enabled]);

  return liveRuns;
}
```

- [ ] **Step 4: Merge live runs into the table**

In `runs-table.tsx`, import and use the hook. Only live-append on the default view (no filters, default sort) so appended rows never contradict an active filter:

```tsx
import { useLiveRuns } from "./use-live-runs";
// ...
  const isDefaultView =
    !hasActiveFilters && query.sortField === "time" && query.sortDir === "desc";
  const liveRuns = useLiveRuns({ enabled: isDefaultView });

  const fetchedRuns = data?.pages.flatMap((p) => p.runs) ?? [];
  const seen = new Set(fetchedRuns.map((r) => r.id));
  const runs = [...liveRuns.filter((r) => !seen.has(r.id)), ...fetchedRuns];
```

(Live rows already carry `.runs-row--enter` fade-in from Task 7's CSS.) Pull `hasActiveFilters` and `query` from the existing `useRunsSearchParams()` call.

- [ ] **Step 5: Verify + typecheck**

Run: `pnpm --filter observe typecheck`
Expected: PASS. In the browser at `/runs` (default view), new rows should fade in at the top every few seconds without moving the scroll position.

- [ ] **Step 6: Commit**

```bash
git add apps/observe/src/lib/observe/api.ts apps/observe/src/lib/observe/api.test.ts apps/observe/src/app/api/runs/stream/route.ts apps/observe/src/app/runs/use-live-runs.ts apps/observe/src/app/runs/runs-table.tsx
git commit -m "feat(observe): SSE live-append of new runs to the feed"
```

---

## Task 12: Optimistic tag mutation + Toast

**Files:**
- Modify: `apps/observe/src/lib/observe/api.ts` (add `applyRunTag`)
- Create: `apps/observe/src/app/api/runs/[id]/tags/route.ts`
- Create: `apps/observe/src/app/runs/use-tag-run.ts`
- Modify: `apps/observe/src/app/providers.tsx` (mount Toast)
- Modify: `apps/observe/src/app/runs/runs-columns.tsx` (tags cell)
- Modify: `apps/observe/src/app/runs/runs-table.tsx` (render tag control)
- Create: `apps/observe/tests/live-feed-tag.spec.ts`

**Interfaces:**
- Produces:
  - `applyRunTag({ id, tag, op }): { id: string; tags: string[] }` — validates and echoes the resulting tags for a run; throws if `tag === "fail"` (deterministic failure hook for the rollback demo/test).
  - `POST /api/runs/[id]/tags` body `{ tag: string; op: "add" | "remove" }`.
  - `useTagRun()` — `useMutation` with optimistic cache update + rollback + Toast feedback.

- [ ] **Step 1: Add `applyRunTag` with tests**

In `api.ts`:

```ts
export function applyRunTag({
  id,
  tag,
  op,
}: {
  id: string;
  tag: string;
  op: "add" | "remove";
}): { id: string; tags: string[] } {
  if (tag === "fail") {
    throw new Error("Tag rejected");
  }
  const run =
    createObserveCorpus().runs.find((r) => r.id === id) ??
    ({ tags: [] } as unknown as Run);
  const current = new Set(run.tags);
  if (op === "add") current.add(tag);
  else current.delete(tag);
  return { id, tags: Array.from(current) };
}
```

Append to `api.test.ts`:

```ts
import { applyRunTag } from "./api";

describe("applyRunTag", () => {
  it("adds and removes tags", () => {
    const added = applyRunTag({ id: "run_0001", tag: "customer", op: "add" });
    expect(added.tags).toContain("customer");
    const removed = applyRunTag({ id: "run_0001", tag: "customer", op: "remove" });
    expect(removed.tags).not.toContain("customer");
  });

  it("throws for the deterministic failure tag", () => {
    expect(() => applyRunTag({ id: "run_0001", tag: "fail", op: "add" })).toThrow();
  });
});
```

Run: `pnpm --filter observe test -- api`
Expected: PASS.

- [ ] **Step 2: Create the mutation route**

Create `apps/observe/src/app/api/runs/[id]/tags/route.ts`:

```ts
import { NextResponse } from "next/server";

import { applyRunTag } from "@/lib/observe/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as { tag: string; op: "add" | "remove" };
  try {
    return NextResponse.json(applyRunTag({ id, tag: body.tag, op: body.op }));
  } catch {
    return NextResponse.json({ error: "Tag rejected" }, { status: 500 });
  }
}
```

Add a matching MSW handler in `apps/observe/src/mocks/handlers.ts` (so tests hit the same behaviour):

```ts
  http.post("*/api/runs/:id/tags", async ({ request, params }) => {
    const body = (await request.json()) as { tag: string; op: "add" | "remove" };
    if (body.tag === "fail") {
      return HttpResponse.json({ error: "Tag rejected" }, { status: 500 });
    }
    return HttpResponse.json({ id: String(params.id), tags: [body.tag] });
  }),
```

- [ ] **Step 3: Mount the Toast provider**

In `apps/observe/src/app/providers.tsx`, import Cedar Toast and wrap children (inside `QueryClientProvider`):

```tsx
import { Toast } from "@jwrighty/cedar-react";
// ...
  return (
    <QueryClientProvider client={queryClient}>
      <Toast.Provider>
        {children}
        <Toast.Region />
      </Toast.Provider>
    </QueryClientProvider>
  );
```

(Confirm the compound names `Toast.Provider`/`Toast.Region` against `packages/react/src/Toast.tsx` exports; substitute if they're named differently.)

- [ ] **Step 4: Implement the optimistic mutation hook**

Create `apps/observe/src/app/runs/use-tag-run.ts`:

```ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@jwrighty/cedar-react";

import type { Run } from "@/lib/observe/domain";

interface TagVars {
  id: string;
  tag: string;
  op: "add" | "remove";
}

interface RunsPage {
  runs: Run[];
  nextCursor: string | null;
  generatedAt: string;
}

export function useTagRun() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, tag, op }: TagVars) => {
      const res = await fetch(`/api/runs/${id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag, op }),
      });
      if (!res.ok) throw new Error("Tag rejected");
      return res.json() as Promise<{ id: string; tags: string[] }>;
    },
    onMutate: async ({ id, tag, op }) => {
      await queryClient.cancelQueries({ queryKey: ["runs"] });
      const snapshots = queryClient.getQueriesData<{ pages: RunsPage[] }>({
        queryKey: ["runs"],
      });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        queryClient.setQueryData(key, {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            runs: page.runs.map((run) =>
              run.id === id
                ? {
                    ...run,
                    tags:
                      op === "add"
                        ? Array.from(new Set([...run.tags, tag]))
                        : run.tags.filter((t) => t !== tag),
                  }
                : run,
            ),
          })),
        });
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
      toast.error({ title: "Couldn’t update tag", description: "Change reverted." });
    },
    onSuccess: () => {
      toast.success({ title: "Tag updated" });
    },
  });
}
```

- [ ] **Step 5: Render the tag control in the table**

Add a "Tags" column to `RUN_COLUMNS` in `runs-columns.tsx` is **not** used here (cells there are static). Instead render tags in the table's `label` cell area. In `runs-table.tsx`, inside the mapped data row, replace the `label` column's cell rendering with a version that shows tags + an add/remove control. Minimal approach — add a dedicated trailing actions cell:

In `runs-columns.tsx`, add a non-sortable actions column marker is out of scope; keep the 7 sortable columns. In `runs-table.tsx`, add one extra `<TableHeaderCell scope="col">Tags</TableHeaderCell>` after the mapped headers and one extra `<TableCell>` per data row:

```tsx
import { useTagRun } from "./use-tag-run";
// inside RunsTable, before return:
  const tagRun = useTagRun();
```

Header (after the `RUN_COLUMNS.map(...)` header cells, still inside the header `<TableRow>`):

```tsx
            <TableHeaderCell scope="col">Tags</TableHeaderCell>
```

Data cell (after the `RUN_COLUMNS.map(...)` data cells, inside each data `<TableRow>`). Stop row navigation from firing when interacting with tags via `stopPropagation`:

```tsx
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <span className="runs-tags" data-testid={`run-tags-${run.id}`}>
                      {run.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="runs-tag"
                          onClick={() => tagRun.mutate({ id: run.id, tag, op: "remove" })}
                        >
                          {tag} ×
                        </button>
                      ))}
                      <button
                        type="button"
                        className="runs-tag runs-tag--add"
                        data-testid={`run-tag-add-${run.id}`}
                        onClick={() => tagRun.mutate({ id: run.id, tag: "flagged", op: "add" })}
                      >
                        + flag
                      </button>
                    </span>
                  </TableCell>
```

Also add the skeleton row's extra cell and the `role="link"` label still works. Add CSS to `runs-feed.css`:

```css
.runs-tags { display: inline-flex; flex-wrap: wrap; gap: var(--semantic-space-inline-xs); }
.runs-tag {
  font: inherit;
  border: 1px solid var(--semantic-color-border, currentColor);
  border-radius: 999px;
  padding: 0 var(--semantic-space-inline-sm);
  background: none;
  cursor: pointer;
}
```

Note: the skeleton branch renders `RUN_COLUMNS.length` cells — add one more skeleton `<TableCell>` so header/skeleton/data column counts match (8 columns).

- [ ] **Step 6: Typecheck + browser check**

Run: `pnpm --filter observe typecheck`
Expected: PASS. In the browser, clicking "+ flag" adds a tag immediately and shows a success toast; the tag persists in the react-query cache.

- [ ] **Step 7: E2E for the optimistic mutation**

Create `apps/observe/tests/live-feed-tag.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("tagging a run applies optimistically and shows a toast", async ({ page }) => {
  await page.goto("/runs");
  const firstRow = page.getByTestId("runs-table").getByRole("link").first();
  await expect(firstRow).toBeVisible();

  // Add a tag on the first row via its add button.
  const addButton = page.getByTestId(/^run-tag-add-/).first();
  await addButton.click();

  await expect(page.getByRole("status").filter({ hasText: "Tag updated" })).toBeVisible();
});
```

Note: to also assert the rollback path, drive the `tag === "fail"` case (e.g. add a test-only add button or trigger via the API in a follow-up); the MSW handler already returns 500 for `fail`, so `toast.error` + rollback fire. Keep the happy-path test as the required E2E; document the failure path as covered by the `applyRunTag` unit test.

Run: `pnpm --filter observe test:e2e -- live-feed-tag`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/observe/src/lib/observe/api.ts apps/observe/src/lib/observe/api.test.ts apps/observe/src/app/api/runs/[id]/tags/route.ts apps/observe/src/app/runs/use-tag-run.ts apps/observe/src/app/providers.tsx apps/observe/src/app/runs/runs-table.tsx apps/observe/src/app/runs/runs-feed.css apps/observe/src/mocks/handlers.ts apps/observe/tests/live-feed-tag.spec.ts
git commit -m "feat(observe): optimistic run tagging with toast feedback"
```

---

## Task 13: Full verification pass + finish

**Files:** none (verification only).

- [ ] **Step 1: Full typecheck + unit + e2e**

Run:
```
pnpm --filter observe typecheck
pnpm --filter observe test
pnpm --filter observe test:e2e
```
Expected: all PASS.

- [ ] **Step 2: Lint/format**

Run the repo's lint/format (e.g. `pnpm lint` / `pnpm format` — confirm scripts). Fix any issues. Expected: clean.

- [ ] **Step 3: Manual acceptance-criteria walkthrough (browser)**

Verify each issue-07/08 acceptance criterion against the running app:
- Dense sortable table with time/label/model/status/tokens/cost/latency; StatusPill status.
- Filters/sort/time-range in the URL; reconstructable; back/forward works.
- Cursor infinite scroll; skeleton rows then fade in.
- Empty state with reset when nothing matches.
- Keyboard: Tab to a row, Enter opens the trace; axe clean.
- New runs append at top over SSE (default view), fading in.
- Optimistic tag apply + toast; failure rolls back.

- [ ] **Step 4: Update the issue files**

Set `Status: done` (or `ready-for-human`) in `.scratch/observe/issues/app/07-live-feed-table.md` and `.scratch/observe/issues/app/08-live-feed-realtime.md`, checking off their acceptance-criteria boxes.

- [ ] **Step 5: Final commit + finish the branch**

```bash
git add .scratch/observe/issues/app/07-live-feed-table.md .scratch/observe/issues/app/08-live-feed-realtime.md
git commit -m "chore(observe): mark live-feed issues 07 + 08 done"
```

Then use the `superpowers:finishing-a-development-branch` skill to decide merge/PR.

---

## Notes for the implementer

- **Cedar prop-name confirmations** flagged inline (Button `variant`, Text `tone`, Toast compound names, muted-text/border/motion token names). Grep the corresponding `packages/react/src/*.tsx` / `packages/tokens` before running each affected step; substitute the real name. These are the only intentional "confirm-then-fill" points and each names exactly what to look up.
- **Script names** (`test`, `test:e2e`, `dev`, `typecheck`, dev port) — confirm in `apps/observe/package.json` and `playwright.config.ts` at Task 4/Step 4 and reuse throughout.
- **Column count invariant**: header, skeleton, and data rows must all render the same number of `<TableCell>`s (7 data columns in Phase A; 8 after the Tags column in Task 12). A mismatch is the most likely regression.
