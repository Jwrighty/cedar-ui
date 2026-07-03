# @jwrighty/cedar-mcp

MCP server for Cedar's agent-consumable surface. It exposes the generated
`cedar.manifest.json` as tools an MCP client can call while coding, so component
usage guidance, accessibility notes, props, variants, and tokens all come from
the same source of truth as `llms.txt`.

## Install

```sh
pnpm add @jwrighty/cedar-mcp
```

For local development in this repo:

```sh
pnpm --filter @jwrighty/cedar-mcp build
pnpm --filter @jwrighty/cedar-mcp test
```

The server reads `@jwrighty/cedar-react/cedar.manifest.json` by default. To test
against another generated manifest, set `CEDAR_MANIFEST_PATH`:

```sh
CEDAR_MANIFEST_PATH=/absolute/path/to/cedar.manifest.json cedar-mcp
```

## MCP Client Config

Register the server with a stdio MCP client:

```json
{
  "mcpServers": {
    "cedar": {
      "command": "cedar-mcp"
    }
  }
}
```

When running from a checkout before publishing:

```json
{
  "mcpServers": {
    "cedar": {
      "command": "node",
      "args": ["/absolute/path/to/cedar-ui/packages/mcp/dist/cli.js"]
    }
  }
}
```

## Tools

- `list_components` returns component names, summaries, status, and public exports.
- `get_component_usage` returns the full generated component entry, including
  `useWhen`, `avoidWhen`, `a11yNotes`, `relatedComponents`,
  `canonicalExample`, `props`, and `variants`.
- `get_example` returns the tested canonical TSX example for one component.
- `get_tokens` returns the manifest token reference, optionally filtered with
  `query`.

## Demo Transcript

User:

```text
Which Cedar component should I use to confirm a decision, and when should I avoid it?
```

Agent calls:

```text
list_components
get_component_usage({ "name": "Button" })
get_example({ "name": "Button" })
```

Agent answer:

```text
Use Button for confirming a decision or triggering an in-page action. Avoid it when navigating to a route; use Link instead. Avoid it for binary on/off state; use Switch or ToggleButton instead. Avoid it for choosing one of several options; use RadioGroup or Select instead. Button's response also includes prop signatures, variants, accessibility notes, and a tested canonical example, so implementation can stay aligned with the shipped React package.
```

The key point: the answer comes from `cedar.manifest.json`, not a separate MCP
copy of Cedar's component guidance.
