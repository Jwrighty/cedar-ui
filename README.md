# Cedar

An accessible, themeable React design system you install and consume like any
real dependency — not a pile of components copied between projects.

## Showcase

**[View the hosted Storybook →](https://main--6a393989afa7ada24819272a.chromatic.com/)**

Themed, documented, interactive Button, TextField, and Dialog — from one link,
nothing to clone. Use the **Theme** control in the toolbar to re-skin every
component live across light, dark, and the Cedar brand theme.

Cedar is published to npm as two packages:

| Package                               | What it is                                                                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@jwrighty/cedar-tokens`](packages/tokens) | The neutral [DTCG](https://design-tokens.github.io/community-group/format/) token source, compiled by Style Dictionary into CSS custom properties + typed TS exports. |
| [`@jwrighty/cedar-react`](packages/react)   | React components (Button, TextField, Dialog) built on [React Aria](https://react-spectrum.adobe.com/react-aria/), styled with CSS Modules against the tokens.         |

## Install

```sh
npm install @jwrighty/cedar-react @jwrighty/cedar-tokens
```

Import the two stylesheets once, then use components anywhere:

```tsx
import "@jwrighty/cedar-tokens/tokens.css";
import "@jwrighty/cedar-react/styles.css";
import { Button } from "@jwrighty/cedar-react";

export function App() {
  return <Button variant="primary">Save</Button>;
}
```

## Theming

Re-skin the entire UI by swapping one attribute — no component code changes:

```html
<body data-theme="dark">
  ...
</body>
```

`light`, `dark`, and an alternate brand theme are driven entirely by CSS custom
properties, and a theme can be scoped to any subtree.

## For AI agents

Cedar treats AI coding agents as a first-class consumer. Every component ships
co-located usage metadata that generates a curated [`llms.txt`](llms.txt), a
machine-readable [`cedar.manifest.json`](cedar.manifest.json), and an
[MCP server](packages/mcp/README.md) an agent can query live while coding.

The case study — what was built, what it cost, and what I'd change — is
[**Designing a Design System for AI Agents**](docs/essays/designing-a-design-system-for-ai-agents.md).

## Development

This is a [pnpm-workspace](https://pnpm.io/workspaces) monorepo.

```sh
pnpm install
pnpm build       # build @jwrighty/cedar-tokens then @jwrighty/cedar-react
pnpm test        # unit + accessibility tests (Vitest + vitest-axe)
pnpm lint
pnpm typecheck
pnpm storybook   # component gallery (apps/docs)
pnpm playground  # Next.js App Router consumer (apps/playground)
```

### Releasing

Cedar uses [Changesets](https://github.com/changesets/changesets). Add a
changeset with `pnpm changeset`, commit it with your change, and merge to
`main`. CI then opens a **"Version Packages"** PR; merging that PR publishes the
bumped packages to npm. See [.changeset/README.md](.changeset/README.md).

## License

[MIT](LICENSE) © Jason Wright
