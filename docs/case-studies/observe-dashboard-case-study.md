# Making Data Arrival Visible in observe

> A case study from [Cedar](../../README.md), focused on the `apps/observe`
> flagship consumer. The goal was to make loading, streaming, and motion legible
> in a portfolio review, without weakening the accessibility baseline.

`observe` is a mocked LLM/agent observability dashboard built to prove Cedar can
hold up in a dense product surface. The useful design problem was not "draw a
dashboard"; it was "make data arrival visible." The app uses deterministic mock
latencies, Suspense boundaries, SSE streams, and tokenized motion so a reviewer
can see information load, settle, update, and open into a trace.

## Motion Captures

### Overview Loading Replay

<video controls muted loop playsinline src="./assets/observe-overview-replay.webm" title="The observe Overview replaying its staged metric and chart loading choreography."></video>

The Overview is intentionally staged: headline metrics arrive first, charts draw
afterward, and the Recent runs preview settles last. The in-app demo control
replays the sequence and scales both animation durations and mock latency with
the same `slowMo` parameter, so the choreography is inspectable instead of gone
in a blink.

### Trace Overlay

<video controls muted loop playsinline src="./assets/observe-trace-overlay.webm" title="A keyboard-opened trace overlay showing focus-managed navigation and the streaming waterfall."></video>

Opening a run from the feed keeps the table mounted behind a Cedar Dialog,
preserves URL filters, moves focus into the overlay, streams the waterfall, and
restores focus to the originating row on close. A hard navigation to the same
`/runs/[id]` route renders the full-page trace instead.

## Decisions

- **URL state over global state:** filters, sort, time range, slow motion, and
  selected trace are reconstructable from the URL.
- **Cedar owns presentation, apps own product state:** TanStack Table drives
  sorting semantics and row state; Cedar table primitives provide styling only.
- **Motion is tokenized:** animations use Cedar motion variables, and
  `prefers-reduced-motion` removes motion-heavy moments while preserving state
  changes.
- **Determinism is a product feature:** the seeded generator and test-mode
  latency map make demos, E2E tests, and motion captures repeatable.

## Accessibility And QA Evidence

| Area | Evidence |
| --- | --- |
| Overview ordering | `apps/observe/tests/smoke.spec.ts` records skeleton/data first-seen times and asserts deterministic metric order. |
| Tag mutation | `apps/observe/tests/live-feed-tag.spec.ts` covers optimistic success, toast feedback, and rollback on failure. |
| Overlay navigation | `apps/observe/tests/smoke.spec.ts` covers feed overlay open, deep-link preservation, inert background, focus trap, close, and focus restore. |
| Axe checks | `apps/observe/tests/smoke.spec.ts` and `apps/observe/tests/live-feed.spec.ts` inject `axe-core` over the key Overview/feed regions. |
| Keyboard | Sidebar collapse, table row open, filter controls, tag buttons, and overlay close are exercised through role-based Playwright flows. |
| Reduced motion | The Overview replay test emulates `prefers-reduced-motion: reduce` and verifies chart draw animations are disabled. |
| Contrast | The teal/off-white palette decision and AA ratios are recorded in [ADR-0010](../adr/0010-default-theme-teal-off-white-palette.md). |
| Responsive | The smoke suite checks narrow Overview card padding and Stat collision resistance at mobile-width card sizes. |

The current local verification pass for this case study was:

```sh
pnpm --filter observe typecheck
pnpm --filter observe test
pnpm --filter observe test:e2e
```

`pnpm --filter observe test:e2e` passed 20 Chromium tests, including the three
M4 headline flows: Overview ordering, tag mutation, and overlay/deep-link/focus
restore.

## Storybook

The Cedar component showcase is published through Chromatic:
[hosted Storybook](https://main--6a393989afa7ada24819272a.chromatic.com/).
That gives the app a browsable design-system companion: reviewers can inspect
the primitives in isolation, then see them carrying a dense product surface in
`observe`.
