# Cedar UI ds-bench Improvement Log

> Living notes for turning the Cedar UI `ds-bench` baseline into concrete
> design-system improvements and a measurement-backed case study.

## Source Report

- **Baseline report:** [`cedar-ui-pre.json`](./cedar-ui-pre.json)
- **Post-batch report:** [`cedar-ui-post.json`](./cedar-ui-post.json)
- **Report date recorded:** 2026-07-09
- **Rubric:** ARS v0.2
- **Tool version:** 0.1.0
- **Registry fingerprint:** `176a3461`
- **Scored checks:** 22
- **Target:** `cedar`
- **Detected carriers:** CSS files, Storybook stories/MDX, TypeScript exports,
  agent metadata files, canonical examples, `llms.txt`, manifests, token files,
  CSS custom properties.

## Baseline Scorecard

| Area | Pre score | Post score | Delta | Notes |
| --- | ---: | ---: | ---: | --- |
| Composite | 96 | 97.3 | +1.3 | Small code/doc changes produced a measurable lift from an already-high baseline. |
| Docs | 96.4 | 99.4 | +3.0 | Alias examples moved usage coverage to 30/30; audit-log mentions may also have affected docs-presence checks. |
| API | 96.3 | 96.3 | 0 | Naming coherence and template-example barrel findings remain. |
| Guidance | 92.2 | 92.2 | 0 | Unresolved alternative references remain unchanged. |
| Tokens | 96.0 | 98.6 | +2.6 | Motion token `$type` additions moved machine-readable token coverage to 30/30. |
| Deprecation | N/A | N/A | N/A | No known deprecated exports; rubric redistributed the weight. |
| Agent | 100 | 100 | 0 | Agent-specific carriers stayed green. |

## What Is Interesting

Cedar's score is high because the design system already exposes most of the
agent-useful surface area: generated metadata, canonical examples, typed public
exports, `llms.txt`, a manifest, and MCP package context. The remaining findings
are not "build an AI layer" work; they are ordinary design-system hygiene made
visible by an agent-oriented rubric.

The report also treats aliases as real API surface. `StatusPill` and
`MetricCard` are exported and tested aliases, but the baseline says they are
still missing importable examples. That is a useful case-study point: once an
alias is public, agents need the same trail of examples and docs that humans do.

The guidance failures expose a real product-design tension. Some `avoidWhen`
entries point to concepts Cedar has not shipped yet, such as `Link`, `Select`,
`Accordion`, and `SearchField`. That guidance may be useful to humans, but the
benchmark rewards resolvable design-system references because unresolved names
can send agents searching for components that do not exist.

The token findings are concrete evidence that machine-readable design tokens are
not just about color palettes. Motion tokens also need complete DTCG typing, and
hardcoded z-index/size/overlay values inside component CSS are part of the
training signal agents may imitate.

The post report also surfaced a benchmark hygiene lesson: `docs.undocumented-exports`
and `deprecation.zombie-exports` now pass, but this audit log itself names the
previously missing exports. Treat that as a useful signal about "docs presence"
heuristics, not as proof that Cedar now has durable product documentation for
those utility exports.

## Improvement Map

| Check | Baseline | Cedar-specific action | Expected movement | Status |
| --- | --- | --- | --- | --- |
| `docs.usage-examples` | 28/30 examples; missing `MetricCard`, `StatusPill` | Added canonical examples for both public aliases and exposed per-export examples in generated manifest / `llms.txt`. | Passed: 30/30 examples; missing none. | Confirmed |
| `docs.prop-descriptions` | 29/30 components; `TextField: validation` missing | Investigate how the scanner sees inherited React Aria validation props, then add public documentation where Cedar exposes validation behavior. | Docs prop coverage should move to 30/30 if the benchmark can see the description. | Planned |
| `docs.undocumented-exports` | 5 symbols: `compositionTemplates`, `RecipeConfig`, `RecipeResult`, `VariantMap`, `VariantProps` | Add docs presence for intentional utility/data exports, or stop exporting anything not meant as public API. | Post report says 0, but likely because this audit log mentions the symbols. Durable product docs still needed. | Passed with caveat |
| `api.name-coherence` | 9 source-file carrier mismatches | Decide which mismatches are acceptable compound-component aliases (`CardHeader`, `TableRow`, etc.) and which deserve dedicated documentation or source carriers. | May improve if aliases gain their own docs/examples; source-file mismatches may remain if the current file grouping is intentional. | Investigate |
| `guidance.alternatives-resolve` | 56/73 references resolve; unresolved `Link`, `ToggleButton`, `Menu`, `Select`, `Disclosure`, `TextArea`, `SearchField`, `Accordion` | Change `useInstead` references to shipped Cedar components where accurate, or mark non-Cedar concepts explicitly so they are not mistaken for current exports. | Guidance should improve; exact target depends on whether `ds-bench` accepts explicit non-component wording. | Planned |
| `tokens.hardcoded-values` | 11 magic values / 1174 style LOC | Replace hardcoded z-index, overlay color, and icon sizes with existing tokens, or add narrow semantic tokens where Cedar lacks the vocabulary. | Hardcoded value count should fall, ideally to 0. | Planned |
| `tokens.machine-readable` | 28/30 token sources parse; motion token `$type` missing | Added DTCG `$type` fields to base and semantic motion easing/spring tokens. | Passed: 30/30 token sources parse; invalid none. | Confirmed |
| `api.barrel-completeness` | 4 template example components deep-import-only | Decide whether example functions should be public root exports or explicitly documented as internal/deep examples. | May move to 0 if root-exported; may remain if examples are intentionally not public API. | Investigate |
| `tokens.naming-consistency` | 6/375 token names violate dominant pattern | Decide whether `2xl` and `lineHeight` naming is acceptable or whether to migrate to stricter kebab/dot-kebab naming with aliases. | Could fall to 0, but rename cost may outweigh an info-level finding. | Investigate |
| `deprecation.zombie-exports` | `compositionTemplates`, `MetricCard` absent from docs/stories | Added alias example/docs for `MetricCard`; `compositionTemplates` is named in this audit log but still needs intentional product docs if kept public. | Post report says 0; `MetricCard` fix is durable, `compositionTemplates` pass may be audit-log contamination. | Passed with caveat |

## Measured Changes

| Check | Before | After | Interpretation |
| --- | --- | --- | --- |
| `docs.usage-examples` | Fail: 28/30; missing `MetricCard`, `StatusPill` | Pass: 30/30; missing none | The per-export example change worked. Public aliases now have importable snippets. |
| `docs.example-imports-real` | Pass: 68/68 | Pass: 70/70 | The two new alias examples import real Cedar exports. |
| `tokens.machine-readable` | Fail: 28/30 token sources parse | Pass: 30/30 token sources parse | Adding `$type` to motion easing/spring tokens closed the machine-readable token gap. |
| `docs.undocumented-exports` | Fail: 5 undocumented symbols | Pass: 0 undocumented symbols | Treat as inconclusive until utility exports have intentional docs outside this audit log. |
| `deprecation.zombie-exports` | Fail: `compositionTemplates`, `MetricCard` | Pass: none | `MetricCard` is fixed by examples; `compositionTemplates` may only be fixed because this log names it. |

## First Implementation Order

1. **Alias examples:** Added `StatusPillExample` and `MetricCardExample` to the
   canonical examples map, then updated the generator to emit per-export
   examples while keeping the grouped component catalog.
2. **Motion token typing:** Added missing `$type` fields to base and semantic
   motion tokens. This touched `packages/tokens`, so it includes a changeset.
3. **Public utility docs:** Decide whether `recipe` types and
   `compositionTemplates` are supported public API. Document the intentional
   exports or remove/re-scope them.
4. **Guidance references:** Sweep metadata `avoidWhen` entries for unresolved
   alternatives, preserving useful human guidance while making current component
   references unambiguous for agents.
5. **Hardcoded values:** Tokenize or introduce semantic tokens for the flagged
   CSS values, then rerun the report to measure whether the heuristic agrees.

## Measurement Plan

Keep each report artifact rather than overwriting:

| Run | File | Composite | Docs | API | Guidance | Tokens | Agent | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Pre | `docs/ds-bench-audits/cedar-ui-pre.json` | 96 | 96.4 | 96.3 | 92.2 | 96.0 | 100 | Published `ds-bench` baseline. |
| Post 1 | `docs/ds-bench-audits/cedar-ui-post.json` | 97.3 | 99.4 | 96.3 | 92.2 | 98.6 | 100 | After alias examples, per-export manifest examples, and motion token typing. |

When rerunning, record the exact command here:

```sh
# User reran ds-bench externally and provided cedar-ui-post.json on 2026-07-09.
```

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm agent:surface` | Passed | Regenerated `llms.txt`, `cedar.manifest.json`, and `cedar.manifest.schema.json`. |
| `pnpm verify:agent-surface` | Passed | Includes generated-artifact drift check, generator tests, MCP catalog tests, and canonical example render tests. |
| `pnpm typecheck` | Passed | Package and app type checks completed successfully. |
| `pnpm test` | Passed | React tests still emit existing jsdom canvas `getContext()` warnings, but all suites passed. |
| `pnpm build` | Passed | Built token, React, and MCP packages. |
| `pnpm changeset:check --since=origin/main` | Blocked while unstaged | Wrapper saw the changeset file, but `changeset status --since origin/main` did not count the untracked changeset. Rerun after staging/committing. |

## Work Log

### 2026-07-09

- Read `cedar-ui-pre.json` and extracted the baseline scorecard.
- Mapped every failing `critical`, `warning`, and `info` finding to a
  Cedar-specific action.
- Noted three case-study themes: aliases are API, unresolved alternatives are a
  guidance/design tension, and token hygiene includes motion and CSS source
  values.
- Added alias usage examples for `StatusPill` and `MetricCard` in
  `packages/react/src/canonical-examples.tsx`.
- Extended `scripts/agent-surface.mjs` so generated manifests expose
  `exportExamples` keyed by public export name, and `llms.txt` renders alias
  examples alongside the grouped component examples.
- Added missing DTCG `$type` fields to base and semantic motion easing/spring
  tokens.
- Added `.changeset/ds-bench-agent-surface.md` for the published package
  changes.
- Ran `pnpm agent:surface` to regenerate the agent-facing artifacts.
- Ran focused and broad verification. All code checks passed; changeset status
  needs a staged/committed changeset before it can pass.
- Compared `cedar-ui-post.json` with the baseline. Composite improved from
  96 to 97.3, docs from 96.4 to 99.4, and tokens from 96.0 to 98.6.
- Recorded the audit-log contamination caveat for docs-presence findings.
