import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getComponentUsage,
  getTokens,
  listComponents,
} from "./catalog.js";
import type { CedarManifest } from "./types.js";

export function createCedarMcpServer(manifest: CedarManifest): McpServer {
  const server = new McpServer({
    name: "@cedar-ui/mcp",
    version: packageVersion(manifest),
  });

  server.registerTool(
    "list_components",
    {
      title: "List Cedar components",
      description: "Return public Cedar component names, summaries, status, and exports.",
      inputSchema: {},
    },
    async () => jsonResult(listComponents(manifest)),
  );

  server.registerTool(
    "get_component_usage",
    {
      title: "Get Cedar component usage",
      description:
        "Return the full generated ComponentMeta for a Cedar component, including usage rules, alternatives, accessibility notes, related components, props, and variants.",
      inputSchema: {
        name: z
          .string()
          .describe("Component name or public export, for example Button or Dialog."),
      },
    },
    async ({ name }) => jsonResult(getComponentUsage(manifest, name)),
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Get Cedar tokens",
      description:
        "Return Cedar's token reference from the generated manifest. Pass a query to filter by token path, category, tier, theme, type, value, or description.",
      inputSchema: {
        query: z.string().optional(),
      },
    },
    async ({ query }) => jsonResult(getTokens(manifest, query)),
  );

  return server;
}

function jsonResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function packageVersion(manifest: CedarManifest): string {
  return manifest.packages.react.version;
}
