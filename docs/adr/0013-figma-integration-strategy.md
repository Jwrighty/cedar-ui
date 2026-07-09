# Figma integration: code-authoritative tokens, negotiated components

Cedar was built code-first with no Figma source. When Figma enters the picture — either to feed the system or to let designers build product screens from it — we adopt a **per-layer authority model** rather than a single global "sync". **Tokens are code-authoritative**: `packages/tokens/src/` (DTCG) is the source of truth, and Figma is a *generated consumer* kept in step via source-level sync and CI drift detection. **Components are negotiated**, not auto-generated: Figma and React hold independent implementations reconciled by a shared contract (inventory, variant/prop parity, shared tokens) plus [Code Connect](https://www.figma.com/code-connect/) and Chromatic — never by codegen in either direction. Behaviour, accessibility, and the `*.meta.ts` governance surface remain code-only and flow *into* Figma rather than being duplicated there.

The authority model, per layer:

| Layer | Authority | Mechanism |
|---|---|---|
| Tokens (`base`/`semantic`/`component`, themes) | **Code** | DTCG source ↔ Figma Variables via Tokens Studio; changes land as PRs against `src/`; CI diffs Figma against source |
| Components (inventory, variants, props) | **Negotiated** | Shared contract reconciled at review; Code Connect surfaces real Cedar JSX inside Figma |
| Behaviour / a11y (React Aria, focus, `onPress`) | **Code only** | No Figma representation; net-new work in any Figma-first build |
| Usage governance (`*.meta.ts`) | **Code only** | `useWhen`/`avoidWhen`/`status` generated *into* a Figma usage panel, not re-authored |

## Why

A design system with Figma has two representations of one system; the failure mode is silent divergence. A single bidirectional "sync" is a mirage for components because Figma cannot represent Cedar's largest value — React Aria behaviour, focus management, `onPress` unification, and the a11y contract recorded in each `*.meta.ts` (ADR-0002, ADR-0009). Forcing components through codegen produces bloated, un-composable output (Figma over-produces one component per visual permutation; code collapses these into props + composition). Tokens are the opposite: already authored in **DTCG** (`$value`/`$type`), they map almost 1:1 onto Figma Variable collections and modes, so that layer *can* be kept honest cheaply. Splitting authority by layer lets each layer use the mechanism it can actually sustain, and keeps Cedar's code-first origin as a strength (the more constrained, rationalised representation) rather than something to dilute toward Figma's inconsistencies.

## Sync operates on the token source, never the built output

The `cedar/size/px-to-rem` transform and `{references}` aliasing exist only in `src/*.json` and `build.js`; `dist/tokens.css` has already lost them (Figma stores `16`, not `1rem`). All Figma-originated token changes therefore target `packages/tokens/src/` as PRs, flow through the existing `build.js` pipeline, and pass the published-package gate (`pnpm changeset:check`) — nothing bypasses token versioning. Themes map to Figma **modes**, subject to Figma's per-collection mode cardinality (three brands × light/dark must be modelled deliberately as modes vs. collections). Composite tokens (typography, shadow) are the known-lossy part of any round-trip and are validated explicitly by drift detection rather than trusted.

## Considered Options

- **Single bidirectional Figma↔code sync across all layers** — rejected: no reliable component auto-sync exists; it would either silently drop behaviour/a11y or generate un-composable code, and would fight Cedar's API conventions (ADR-0005).
- **Figma-authoritative tokens (design → code)** — rejected for a code-first system: our DTCG source is the cleaner, transform-bearing representation; inverting authority would push `px→rem` and aliasing decisions into a tool that cannot express them.
- **Direct Figma REST API as the token bridge** — deferred in favour of Tokens Studio, which speaks DTCG natively (matching `src/`) and preserves references; the raw API flattens aliasing and would make us own the DTCG↔Figma translator.
- **Duplicate usage guidance as a Figma docs page** — rejected: guarantees drift from `*.meta.ts`; generate the Figma usage panel *from* the metadata instead (same single-source principle as ADR-0009).
- **Drift *sync* vs. drift *detection*** — we prioritise a CI job that diffs Figma Variables against `src/*.json` and reports divergence over any push-button sync; prevention of drift is more valuable and cheaper to trust than reconciliation after the fact.

## Consequences

- **Tokens gain a second consumer.** The token pipeline stays the single source; Figma joins CSS and typed TS as an output. Sync tooling (Tokens Studio, git-based) and a drift-detection CI job are the concrete follow-up work, tracked separately in `.scratch/`.
- **Code Connect is the highest-ROI component investment** — it makes Cedar code authoritative *inside* Figma (real `<Button>` JSX + props on selection) without pretending to auto-generate, and directly serves the designer→engineer screen-building workflow.
- **The agent surface pays a second dividend.** Figma-to-code translation (human or agent) is far more reliable against a library that ships machine-readable usage metadata; the `llms.txt`/manifest/MCP artifacts of ADR-0009 already provide it.
- **A Figma-first (re)build would be scoped in this order**: extract tokens → DTCG → `src/`; inventory components/variants as React specs; reconcile taxonomy to ADR-0005 (do not let Figma naming leak into the public API); then fill the behaviour/a11y gap as net-new work; finally backfill `*.meta.ts` governance. The behaviour/a11y gap is the largest single chunk and is exactly where the React Aria foundation is strongest.
- **This ADR records the posture, not an implementation commitment.** No Figma integration ships until the sync mechanism and drift-detection job are specced and gated, consistent with how ADR-0009 phased its aggregation artifacts.
