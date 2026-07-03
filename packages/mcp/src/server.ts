import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getComponentExample,
  getComponentUsage,
  getTemplate,
  getTokens,
  listComponents,
  listTemplates,
} from "./catalog.js";
import type { CedarManifest } from "./types.js";

/**
 * Build the Cedar MCP server over a loaded {@link CedarManifest}, registering
 * the component, template, and token tools. The caller is responsible for
 * connecting it to a transport (see `cli.ts`).
 */
export function createCedarMcpServer(manifest: CedarManifest): McpServer {
  const server = new McpServer({
    name: "@jwrighty/cedar-mcp",
    version: packageVersion(manifest),
  });

  server.registerTool(
    "list_components",
    {
      title: "List Cedar components",
      description:
        "Return public Cedar component names, summaries, status, and exports.",
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
          .describe(
            "Component name or public export, for example Button or Dialog.",
          ),
      },
    },
    async ({ name }) => jsonResult(getComponentUsage(manifest, name)),
  );

  server.registerTool(
    "get_example",
    {
      title: "Get Cedar component example",
      description:
        "Return the tested canonical TSX example for a Cedar component from the generated manifest.",
      inputSchema: {
        name: z
          .string()
          .describe(
            "Component name or public export, for example Button or Dialog.",
          ),
      },
    },
    async ({ name }) => jsonResult(getComponentExample(manifest, name)),
  );

  server.registerTool(
    "list_templates",
    {
      title: "List Cedar composition templates",
      description:
        "Return public Cedar composition template ids, summaries, status, and composed components.",
      inputSchema: {},
    },
    async () => jsonResult(listTemplates(manifest)),
  );

  server.registerTool(
    "get_template",
    {
      title: "Get Cedar composition template",
      description:
        "Return a generated Cedar composition template, including use cases, skeleton layout, composed components, and tested TSX example.",
      inputSchema: {
        id: z.string().describe("Template id, for example form-dialog."),
      },
    },
    async ({ id }) => jsonResult(getTemplate(manifest, id)),
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
