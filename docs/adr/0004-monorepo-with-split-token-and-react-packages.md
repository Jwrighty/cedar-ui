# Monorepo with split token and React packages

The repo is a **pnpm-workspace monorepo**. Tokens and components are separate packages — `packages/tokens` (the neutral source of truth, compiled to CSS custom properties + typed TS exports) and `packages/react` (components, which depend on `tokens`) — so the token/React separation that is this project's thesis is *visible in the file structure*, not merely conceptual. An `apps/` folder holds the Storybook docs site and an in-repo `playground` that consumes `packages/react` via the workspace protocol, proving the package is genuinely installable and consumable rather than imported by relative path.

## Considered Options

- **Single package with tokens as an internal folder** — rejected: hides the exact token/React seam the project exists to demonstrate.
- **Monorepo + Turborepo/Nx** — deferred: task-orchestration and CI caching earn their keep at ~5+ packages with expensive builds; at this scale they are config surface and delivery risk for caching that won't be felt. Turborepo can be added later as a deliberate "scaling the monorepo" story.

## Consequences

- The *real* consuming apps (real-time collaboration, analytics dashboard) live in **separate repos** and pull the published package; the in-repo `apps/playground` is only the fast-iteration consumer during the walking-skeleton phase.
- Genuine `npm publish` + external consumption is part of the later release phase — it is what proves the package stands alone.
