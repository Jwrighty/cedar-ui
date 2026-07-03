# Designing a Design System for AI Agents

> A case study from [Cedar](../../README.md), a React + TypeScript design system. Audience: engineers and interviewers. This is a portfolio asset — committed deliberately, unlike Cedar's local-only learning backlog. Every claim below links to the artifact that backs it.

AI coding agents now write a large share of the code that consumes a design system. Cedar treats that as a first-class audience — co-equal with humans — and the interesting result is how *little* extra machinery it took to serve them well, once the system already had good bones. This is the write-up of what was built (an `llms.txt`, a generated [manifest](../../cedar.manifest.json), and an [MCP server](../../packages/mcp/README.md)), what it cost, and what I'd change.

## 1. The problem

Agents fail against a design system in specific, repeatable ways:

- **Hallucinated APIs** — inventing props or component names that don't exist.
- **Wrong-component selection** — reaching for a Dialog where a Popover belongs; a Button where a Link is correct.
- **Ignored accessibility** — bypassing the affordances the system already provides.
- **Invented token values** — hardcoding `#3b82f6` instead of using the scale.

There's also a fourth, subtler failure I only saw once Cedar was in front of an agent: **"helpful" normalization**. Cedar deliberately preserves React Aria's prop names — `onPress`, `isDisabled`, `isSelected` — rather than re-normalizing to `onClick`/`disabled` ([ADR-0005](../adr/0005-component-api-conventions.md)). An agent trained on a million `onClick` handlers will "correct" your code toward the familiar DOM name unless something authoritative tells it the unfamiliar name is intentional.

Human-oriented documentation — prose guides, a Storybook gallery — doesn't fix any of this. Agents don't browse; they retrieve. They need *structured, machine-readable, retrievable* guidance, and they need it to say not just "here's the API" but "here's when **not** to reach for this."

## 2. What makes a system agent-amenable — and how Cedar already was

The strongest realisation of the project: **good design-system hygiene is already most of agent-readiness.** Cedar needed no re-architecting, only aggregation. Three properties that were there for human reasons turned out to be exactly what an agent needs:

- **A machine-readable design language.** Cedar's tokens are neutral [DTCG](https://design-tokens.github.io/community-group/format/) JSON compiled by Style Dictionary ([ADR-0001](../adr/0001-react-first-with-neutral-token-pipeline.md)). An agent can read the entire visual language as data instead of scraping hex values out of CSS.
- **A consistent, predictable API surface.** One house style — compound components, `forwardRef` everywhere, controlled/uncontrolled pairs, variant-props-to-data-attributes ([ADR-0005](../adr/0005-component-api-conventions.md)) — means an agent learns the *shape* once and predicts the rest. Consistency is a form of compression.
- **Recorded rationale and a glossary.** The [ADRs](../adr/) and [`CONTEXT.md`](../../CONTEXT.md) are ingestible context. The glossary even encodes the words to *avoid* ("primitive token" collides with "Primitive component"), which is precisely the kind of disambiguation an agent benefits from.

So the work of [ADR-0009](../adr/0009-agent-consumable-surface-usage-metadata.md) was framed as *formalising an existing strength*, not bolting on a parallel system. That framing is the whole thesis: you don't build an "AI layer," you expose the structure you should have had anyway.

## 3. The artifact stack

The source of truth is **per-component usage metadata** — a typed object co-located with each component as a `*.meta.ts` file. All 14 public Cedar components carry one. Its shape ([ADR-0009](../adr/0009-agent-consumable-surface-usage-metadata.md)):

```ts
export interface ComponentMeta {
  summary: string;                                          // one-line purpose
  useWhen: string[];                                        // when this is right
  avoidWhen: { situation: string; useInstead: string }[];   // when to reach elsewhere
  a11yNotes: string[];                                      // a11y behaviours to rely on / preserve
  relatedComponents: string[];
  status: "experimental" | "stable" | "deprecated";
}
```

`avoidWhen` is the load-bearing field — the "when *not* to use this, and what instead" guidance that is the highest-value, lowest-supply piece of documentation in any design system. It is the direct antidote to wrong-component selection. Button's entry, for example, says: navigating to a URL → use Link; toggling a binary state → use Switch; choosing one of several options → use RadioGroup. An agent reading that picks the right component before it writes a line.

Three artifacts *derive* from that metadata — none is hand-maintained:

- **[`llms.txt`](../../llms.txt)** — the curated entry point. A one-paragraph overview plus a per-component digest (summary + `useWhen`/`avoidWhen` + a11y notes), with links out to the glossary, ADRs, and token reference. It's what you point an LLM at first.
- **[`cedar.manifest.json`](../../cedar.manifest.json)** (+ a [JSON schema](../../cedar.manifest.schema.json)) — the full machine-readable description. The generator pulls component metadata from the built package, **prop signatures and TSDoc from the TypeScript checker**, **variants from the `recipe()` calls**, and the **token reference from the DTCG source**. One file a UI-generation tool reads to use Cedar correctly.
- **[`@jwrighty/cedar-mcp`](../../packages/mcp/README.md)** — an MCP server (the capstone) exposing `list_components`, `get_component_usage(name)`, `get_example(name)`, `list_templates`, `get_template(id)`, and `get_tokens(query?)` as tools an agent calls *live*, mid-session, backed by the same manifest. "Which Cedar component confirms a decision, when should I avoid it, and what does correct usage look like?" is answerable end-to-end from the server alone.

Two more artifacts followed the same derive-from-source discipline. **Canonical examples** — a tested, copy-pasteable snippet per component, authored in `packages/react/src/canonical-examples.tsx` and rendered under test so it can't rot — flow into the manifest, the `llms.txt` digest, and MCP's `get_example`. Usage *rules* prevent the wrong component; a canonical *example* prevents wrong usage of the right one. **Composition templates** are a parallel surface for the page-level assemblies agents get wrong: a typed `TemplateMeta` (id, summary, `useWhen`, the components it composes, a skeleton layout, a tested example) covering form-dialog, filterable-table, settings-page, and an async-state panel. They emit into the manifest, a dedicated `llms.txt` section, and MCP's `list_templates`/`get_template` — and each renders in Storybook from the *same* tested example function, so the human gallery and the agent surface can't drift.

Rich **TSDoc** on every export complements all of this: agents read types, so inline guidance reaches them — and IDE users — for free.

## 4. Single source of truth, or it drifts

Every artifact above is generated from one co-located metadata object. This is the non-negotiable constraint, and the project considered the alternatives explicitly ([ADR-0009](../adr/0009-agent-consumable-surface-usage-metadata.md)):

- **Generate everything from TSDoc / react-docgen.** Rejected: TSDoc can't cleanly express `avoidWhen`/`useInstead`. A typed meta object is richer and just as machine-readable. (TSDoc is still used — for prop-level detail, which it's good at.)
- **Maintain agent docs separately from human docs.** Rejected outright: two sources guarantee drift. The moment "when to use Popover" lives in two files, one of them is wrong.

The mechanism that makes "single source" real rather than aspirational is a **drift check in CI**. `pnpm agent:surface` regenerates `llms.txt`, the manifest, and the schema; `pnpm agent:surface:check` fails the build if any committed artifact is stale. Co-location is the design; the CI gate is the enforcement. Without the gate, "derive everything from metadata" decays into "we meant to regenerate that."

## 5. Trade-offs & costs

This was not free, and pretending otherwise would make it un-defensible.

- **Metadata is real authoring work.** Every component now needs honest `useWhen`/`avoidWhen` prose. The mitigating decision was to adopt the convention **from the very first component (Button)**, so it's part of the per-component loop, never a backfill across a widening set ([ADR-0009](../adr/0009-agent-consumable-surface-usage-metadata.md) consequences). Backfilling usage rules across 14 components after the fact would have been the project that never happened.
- **`avoidWhen` rules can outrun the system.** This is the sharpest lesson from building it. Button's metadata points "navigating to a URL → use **Link**", but Link isn't a shipped Cedar component yet. The generator surfaces this honestly — `llms.txt` annotates "(Link not currently listed in Cedar public components.)" — rather than hiding it. The tension is real: the most useful guidance ("use something else") naturally references components you haven't built. I chose honest dangling pointers over silence; the alternative (only ever referencing shipped components) would make the guidance weaker exactly where it's most valuable.
- **The generator couples to the build.** Component metadata is read from the *built* package (`packages/react/dist`), not source, so the manifest can only regenerate after a build. That keeps the runtime contract (what consumers actually import) as the thing of record, but it means the agent-surface step sits downstream of `pnpm build` in CI.
- **The MCP server is a third surface to maintain.** It was deliberately scoped as a **capstone/stretch, gated behind the manifest being green** — not a commitment competing with shipping components. Because it's a thin read-through over the manifest (no separate copy of anything), its marginal maintenance cost is low. But it *is* another package, another README, another thing that can break. For a portfolio it earns its keep as the showpiece; for a small internal system, `llms.txt` + manifest might be the right stopping point.

When is this worth it? When agents materially consume your system and the cost of a wrong-component or hallucinated-API bug is paid repeatedly. For a three-component widget library used by two humans, it's over-engineering. The honest answer is that the metadata and `llms.txt` are worth it almost always; the manifest when you have machine consumers; the MCP server when live, in-session querying changes outcomes (or when, as here, it's the artifact that proves the thesis).

## 6. At organisation scale

What would make this hold up across a team and many components:

- **Governance of the rules.** `useWhen`/`avoidWhen` are opinions, and opinions need an owner. At scale, usage rules deserve the same review rigor as the API itself — a design-systems reviewer signing off that "Dialog vs Popover" guidance is correct, because a confidently wrong `avoidWhen` is worse than none.
- **A lint rule, not a convention.** "Every component has a `*.meta.ts`" should be enforced by a lint rule that fails on a missing or empty meta, not by reviewer vigilance. Cedar's drift check guarantees the *artifacts* match the metadata; a lint rule would guarantee the *metadata exists* in the first place.
- **Manifest in the release pipeline.** The manifest and `llms.txt` should be versioned and published *with* the package (Cedar already emits a copy under `packages/react/`), so a consumer pinning `@jwrighty/cedar-react@0.2.0` gets the matching surface, not whatever's on `main`.
- **Measure it.** The thing I'd most want and don't yet have: agent error rates over time — hallucinated props, wrong-component picks — as a metric the metadata is *trying to move*. Without measurement, "agent-readiness" is a story; with it, it's a number you can defend.

## 7. What I'd do differently / open questions

- **`useInstead` should be a typed reference, not a string.** Today it's free text ("use Link instead"), which is why dangling pointers to unbuilt components are possible. If `useInstead` referenced a component identifier, the drift check could *validate* the target exists (or is explicitly marked "planned"), turning an honesty problem into a type error.
- **Canonical examples and composition templates — flagged here, since shipped.** This section originally listed canonical examples as the highest-value missing artifact — the reserved `get_example(name)` tool that went unbuilt. Both are now delivered. Canonical examples (issue 01) ship as a tested snippet per component, generated from a rendered artifact so it can't rot, exposed through `get_example`; usage *rules* prevent the wrong component, a canonical *example* prevents wrong usage of the right one. Composition templates (issues 02–03, surfaced in Storybook in 06) followed for the page-level assemblies agents get wrong, each rendered from the same tested function the manifest and MCP read. The realized design held the single-source line — every example and template derives from a tested artifact, not a hand-maintained copy. The new trade-off they surfaced is honest to record: `TemplateMeta` is a *second* typed surface whose `components` lists name components by string, the same dangling-reference risk `avoidWhen` carries and a candidate for the same typed-reference validation below.
- **Is `llms.txt` the right format, or a transitional one?** It's an emerging convention with no validator and no guarantee agents privilege it. The manifest is the durable artifact; `llms.txt` is the bet that a human-readable, link-first entry point is what today's agents actually ingest. I'd revisit that bet as the ecosystem settles.
- **Generating *from* a richer source.** Long-term, prop docs, variants, and metadata could converge into one authored surface that emits both the runtime component and every doc artifact — eliminating even the "metadata in `.meta.ts`, props in `.tsx`" split. That's a bigger bet than this phase justified, but it's the direction the single-source principle points.

The throughline: the work that makes a design system good for *humans* — neutral tokens, one consistent API, recorded rationale, honest "use something else" guidance — is the same work that makes it legible to *agents*. The agent-specific layer is thin, and it should be. If it's thick, you're probably papering over a system that wasn't well-structured to begin with.
