# React-first design system with a framework-neutral, 3-tier token pipeline

We build a React + TypeScript component library rather than a framework-agnostic core, because the systems that will consume it are React and a *visibly consumed* library is the stronger portfolio signal. Tokens are authored once in a neutral (DTCG-shaped) format and compiled — across three tiers, **primitive → semantic → component** — into CSS custom properties plus typed TypeScript exports, so React is *one consumer* of the tokens rather than their owner. The tiers are named **base → semantic → component** ("primitive" is reserved for the component category — see `CONTEXT.md`). Theming (light/dark plus one alternate brand, with density planned as a third axis) is a runtime attribute swap over those CSS custom properties: no rebuild, and themeable per subtree.

## Considered Options

- **Framework-agnostic web-component / headless core with thin React bindings** — rejected: the agnosticism is invisible to a portfolio reviewer and the plumbing (custom-element lifecycle, SSR quirks, adapters) spends the time budget where it can't be seen. Authoring tokens in a neutral format preserves ~80% of the multi-platform story for ~20% of the cost.
- **Tokens hardcoded as TypeScript constants** — rejected: loses the neutral source-of-truth seam that demonstrates understanding of a design system as a multi-platform system.
- **2-tier tokens (base → semantic only)** — rejected: a component tier is added so components can deviate from semantics where genuinely needed; the multi-brand demo is what justifies the tiers earning their keep.
