# Live feed (`/runs`) — design

Date: 2026-07-01
Issues: `.scratch/observe/issues/app/07-live-feed-table.md`, `.scratch/observe/issues/app/08-live-feed-realtime.md`
Parent: `.scratch/observe/PRD.md` (milestone M2 — Live feed)

## Summary

Build the `/runs` "Live feed" surface for `apps/observe`: a dense, sortable
TanStack Table rendering into Cedar table-cell primitives, with filters / sort /
time-range encoded in the URL, cursor-based infinite scroll, a designed empty
state, SSE live-append of new runs, and one optimistic tag mutation with Toast
feedback. Keyboard-operable and axe-clean throughout.

This covers **two issues as one coherent surface**, phased:

- **Phase A (issue 07 — table):** server-side filter/sort/cursor API, TanStack
  Table into Cedar cells, URL state, infinite scroll, empty state, keyboard/axe.
- **Phase B (issue 08 — realtime + mutation):** SSE live-append, optimistic tag
  mutation + Toast, in-place status transitions.

## Context (existing building blocks)

Confirmed by codebase exploration:

- **Data layer** — `apps/observe/src/lib/observe/domain.ts` (`Run` type),
  `api.ts` (`listRunsPayload({ cursor, limit, testMode, slowMoMultiplier })`,
  cursor-only today), `app/api/runs/route.ts` (`GET /api/runs`), MSW handler in
  `src/mocks/handlers.ts`. Detail page at `app/runs/[id]/page.tsx`.
- **No `/runs` index route exists yet** — nav links to `/runs` but only
  `/runs/[id]` is implemented, so `/runs` currently 404s. This design creates it.
- **`Run` has no `tags` field today** — the issue-08 mutation requires adding one.
- **Cedar primitives ready:** `Table`, `TableRow` (`isInteractive`),
  `TableCell` / `TableHeaderCell` (`align`, `density`, `isNumeric`), `StatusPill`
  (`status: neutral|running|success|error`, `size`), `Skeleton` (`shape`),
  `Toast`. All in `packages/react`.
- **react-query** wired via `app/providers.tsx` (`staleTime: 30_000`).
  **TanStack Table is NOT installed** — must add `@tanstack/react-table` to
  `apps/observe`.
- **URL state pattern:** plain Next `useSearchParams` + `useRouter` +
  `startTransition` (see `demo-mode-control.tsx`). No `nuqs`.
- **Reference:** `app/overview-recent-runs.tsx` wires Suspense + Table +
  StatusPill + Skeleton — closest existing analogue.
- **Tests:** Playwright E2E in `apps/observe/tests` (Chromium, port 3010,
  role-based queries + injected axe-core); vitest (node) for unit; MSW for
  network mocking.

## Decisions

- **Filter/sort live server-side.** Extend `/api/runs` + the generator to accept
  `status`, `model`, `environment`, `from`, `to`, `sort`, `cursor`, `limit`.
  react-query `useInfiniteQuery` keys off the URL params; TanStack Table is
  presentation + sort-UI only. This keeps the cursor-based infinite-scroll
  contract honest and matches the PRD's "query caches key off them".
- **Add `tags: string[]` to the `Run` domain type**, seeded deterministically by
  the generator. Required for the optimistic tag mutation; no tags field exists
  today.
- **Create the missing `app/runs/page.tsx` index route.**
- **URL is the source of truth** for filters, sort, and time range; the view is
  fully reconstructable from the URL and back/forward works. No global store.

## Architecture

### Route

`app/runs/page.tsx` — thin RSC. Reads `searchParams` (for SSR-consistent initial
render / deep links), renders the client `LiveFeed` inside the existing
`DashboardShell` content region. Aligns to the page-layout contracts in the PRD
(`width: min(100%, 60rem)`, vertical rhythm via semantic space tokens, no re-added
outer padding).

### Data layer (`lib/observe` + route handlers + MSW)

1. **`domain.ts`** — add `tags: string[]` to `Run`.
2. **Generator** — seed deterministic tags per run. Existing fields already cover
   every column and filter (`status`, `model`, `environment`, `startedAt`,
   `durationMs`, `tokensIn/Out`, `costUsd`).
3. **`api.ts` `listRunsPayload`** — accept `status`, `model`, `environment`,
   `from`, `to`, `sort` (`field:dir`), `cursor`, `limit`. Apply in order
   **filter → sort → cursor-slice**. Return `{ runs, nextCursor, generatedAt }`.
   Add a small facets helper returning distinct `models` / `environments` so
   filter dropdowns are data-driven rather than hardcoded.
4. **`app/api/runs/route.ts`** — parse the new query params, delegate to
   `listRunsPayload`.
5. **MSW handler** — mirror the same parsing/behaviour so tests and Storybook
   match production.
6. **Phase B — `GET /api/runs/stream`** (SSE) — emits new runs on a timer (test
   mode collapses to deterministic small intervals).
7. **Phase B — `POST /api/runs/[id]/tags`** — add/remove a tag on a run, shaped
   for optimistic update + rollback.

### Client components (`app/runs/`)

- **`LiveFeed`** (client shell) — owns URL read/write via a `useRunsSearchParams`
  helper (Next `useSearchParams`/`useRouter`, `startTransition`). Composes the
  filter bar and the table. Derives the react-query key from the current params.
- **`RunsFilterBar`** — status / model / environment / time-range controls that
  write to the URL, plus a **Reset** action. Model/environment options come from
  the facets helper.
- **`RunsTable`** — TanStack Table column defs for
  **time / label / model / status / tokens / cost / latency**, rendering into
  Cedar `TableRow` / `TableCell` (`isNumeric` on numeric columns, `StatusPill`
  for status). Sort state is derived from and written to the URL. Data via
  `useInfiniteQuery` keyed on all params; an **IntersectionObserver sentinel**
  row triggers `fetchNextPage`. Skeleton rows reserve the exact final height,
  then cross-fade to content. Rows are `isInteractive`, focusable, and
  Enter/click navigates to `/runs/[id]` (keyboard-operable).
- **Empty state** — inviting copy + a Reset action when filters match no runs.
- **Phase B additions:**
  - SSE subscription prepends new runs with a fade-in, without disturbing scroll
    position.
  - Per-row tag control using `useMutation` with optimistic update, rollback on
    error, and `Toast` feedback (success + failure).
  - In-place status transition (running → success/error) with no layout shift.

### Motion & accessibility

- Reuse existing motion tokens / framer patterns: skeleton→content cross-fade,
  live-row fade-in, status transition in place. Every moment has a
  `prefers-reduced-motion` variant (instant or cross-fade).
- Zero layout shift is a requirement — skeletons reserve exact dimensions.
- Native table semantics via Cedar cells; app owns the table's ARIA label and row
  focus management. axe-clean.

## Testing

- **Playwright E2E** over the headline flows:
  1. Filters/sort/time-range are reconstructable from the URL; back/forward works.
  2. Empty state appears when filters match nothing; Reset restores results.
  3. Optimistic tag mutation applies immediately and rolls back on failure.
  4. Infinite scroll loads further pages.
- MSW-backed determinism (seeded generator) underpins stable assertions.
- No app-level visual regression (per PRD). Cedar primitives already carry their
  own component tests + Chromatic stories.

## Release checklist

- App-only work needs **no changeset**. If the domain `tags` addition or any
  change ends up touching `packages/tokens` or `packages/react`, add a
  `.changeset/*.md` entry per affected published package before committing and run
  `pnpm changeset:check --since=origin/main`.

## Out of scope

- The trace-detail shared-element overlay (issue 09 / M3).
- Any real backend, auth, or persistence.
- A Cedar-level data-grid/table abstraction (ADR-0006 delegates grids to TanStack).
- App-level visual regression.
