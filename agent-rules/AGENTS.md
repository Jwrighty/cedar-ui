# AGENTS.md for Cedar consumers

These are generated rules for projects that consume Cedar. Copy this file to the matching root file in a consumer repo. Do not confuse it with Cedar's repo-internal contributor `AGENTS.md` or other maintainer instructions.

## Source of Truth

- Use Cedar's generated `llms.txt` for component summaries, usage guidance, accessibility notes, and tested examples.
- Use the Cedar MCP server from `@jwrighty/cedar-mcp` for live API detail while coding. Register the `cedar-mcp` command with your MCP client when available.
- Prefer MCP tools or `llms.txt` over guessing component props, variants, token names, or template structure.

```json
{
  "mcpServers": {
    "cedar": {
      "command": "cedar-mcp"
    }
  }
}
```

## Imports

- Import Cedar React components only from `@jwrighty/cedar-react`.
- Import Cedar token utilities only from `@jwrighty/cedar-tokens`.
- Import Cedar CSS once near the app root:

```tsx
import "@jwrighty/cedar-tokens/tokens.css";
import "@jwrighty/cedar-react/styles.css";
import { Button } from "@jwrighty/cedar-react";
```

- Do not import from Cedar source files, package internals, generated `dist` paths, or copied component code.

## Styling

- Do not use inline styles to customize Cedar components.
- Use CSS classes, app stylesheets, and Cedar CSS custom properties for layout and presentation.
- Use Cedar tokens instead of magic values for color, spacing, radius, typography, motion, and component-level styling.
- Prefer semantic or component tokens before reaching for base tokens.

## React Aria Props

- Preserve React Aria prop names on Cedar components.
- Use `onPress`, not `onClick`, for Cedar press interactions such as `Button` and `IconButton`.
- Use `isDisabled`, not `disabled`, for disabled Cedar controls.
- Check `llms.txt`, the generated manifest, or the MCP server before renaming props to DOM-style alternatives.

## Component Choice

- Choose components from Cedar's public catalog before inventing local UI primitives.
- Read each component's `useWhen`, `avoidWhen`, accessibility notes, and canonical example before composing new UI.
- If a needed component is not in Cedar's public catalog, build the smallest app-local wrapper and keep it styled with Cedar tokens.

Generated for Codex; source packages: `@jwrighty/cedar-react`, `@jwrighty/cedar-tokens`, `@jwrighty/cedar-mcp`.
