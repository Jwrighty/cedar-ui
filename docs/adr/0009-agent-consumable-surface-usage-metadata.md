# Agent-consumable surface; usage metadata as the source of truth

Cedar treats consumability by **AI coding agents** (Claude, Codex, UI-generation tools) as a first-class concern alongside human consumption. The single source of truth is **per-component usage metadata** — a typed object co-located with each component — which feeds *both* the human docs (Storybook MDX) and the machine-readable agent artifacts (an `llms.txt`, a generated manifest, and an MCP server). Rich **TSDoc** on every export complements it, since agents read types.

The decided metadata shape (encodes the decision more precisely than prose):

```ts
export interface ComponentMeta {
  /** One-line purpose. */
  summary: string;
  /** Situations where this component is the right choice. */
  useWhen: string[];
  /** Situations to reach for something else — and what. The highest-value field. */
  avoidWhen: { situation: string; useInstead: string }[];
  /** Accessibility behaviours a consumer can rely on / must preserve. */
  a11yNotes: string[];
  /** Sibling components worth knowing about. */
  relatedComponents: string[];
  status: "experimental" | "stable" | "deprecated";
}
```

## Why

Agents fail in two characteristic ways: they **hallucinate component APIs**, and they **choose the wrong component** (a Dialog where a Popover belongs) or ignore accessibility affordances. A consistent, machine-readable surface addresses the first; structured `avoidWhen` + `useInstead` rules address the second — and "when *not* to use this" is the highest-value, lowest-supply piece of guidance. Cedar is already partly amenable (neutral DTCG tokens are machine-readable; ADRs + glossary are ingestible rationale; one API house style means an agent learns the shape once), so this **formalises an existing strength** rather than adding a parallel system.

## Single source of truth

Metadata is **co-located with the component** (e.g. a `*.meta.ts` exporting a typed `ComponentMeta`), not duplicated in docs. Human docs and every machine artifact *derive* from it, so they cannot drift apart.

## Considered Options

- **Generate metadata purely from TSDoc / react-docgen** — rejected: TSDoc can't cleanly express usage rules like `avoidWhen`/`useInstead`. A typed meta object is richer and still fully machine-readable. (TSDoc is still used, for prop-level detail.)
- **Maintain agent docs separately from human docs** — rejected: guarantees drift. One source feeding both is the constraint.

## Consequences

- The metadata convention is adopted **from the first component (Button)** to avoid expensive backfill across the widening set. It is part of the per-component loop, not a later phase.
- Aggregation artifacts (`llms.txt`, manifest) and the **MCP server** are **Phase 3** (`.scratch/agent-consumable-surface/`), explicitly gated behind the walking skeleton being green. The MCP server is a capstone/stretch, not a skeleton commitment.
