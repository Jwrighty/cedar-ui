import { describe, expect, it } from "vitest";
import {
  getComponentUsage,
  getTokens,
  listComponents,
} from "../src/catalog.js";
import type { CedarManifest } from "../src/types.js";

const manifest: CedarManifest = {
  schemaVersion: 1,
  name: "Cedar",
  packages: {
    react: { name: "@jwrighty/cedar-react", version: "0.2.0" },
    tokens: { name: "@jwrighty/cedar-tokens", version: "0.2.0" },
  },
  generatedFrom: {},
  components: [
    {
      name: "Button",
      exports: ["Button"],
      status: "experimental",
      summary: "A pressable action primitive.",
      useWhen: ["Triggering an immediate action."],
      avoidWhen: [
        {
          situation: "Navigating to another page",
          useInstead: "Link",
        },
      ],
      a11yNotes: ["Always provide a clear accessible name."],
      relatedComponents: [],
      props: [],
      variants: [
        {
          name: "tone",
          options: ["neutral", "accent"],
        },
      ],
    },
  ],
  tokens: {
    sources: [
      {
        path: "packages/tokens/src/semantic/color.json",
        tier: "semantic",
        category: "color",
        tokens: {
          semantic: {
            color: {
              action: {
                background: {
                  $value: "{base.color.blue.600}",
                  $type: "color",
                },
              },
            },
          },
        },
      },
    ],
  },
};

describe("catalog", () => {
  it("lists component names and summaries", () => {
    expect(listComponents(manifest)).toEqual([
      {
        name: "Button",
        summary: "A pressable action primitive.",
        status: "experimental",
        exports: ["Button"],
      },
    ]);
  });

  it("returns full usage metadata by component name", () => {
    expect(getComponentUsage(manifest, "button").name).toBe("Button");
  });

  it("reports available components for unknown usage lookups", () => {
    expect(() => getComponentUsage(manifest, "Card")).toThrow(
      /Unknown Cedar component "Card". Available components: Button./,
    );
  });

  it("filters tokens by path and value", () => {
    const tokens = getTokens(manifest, "blue.600");

    expect(tokens.sources).toHaveLength(1);
    expect(tokens.matches).toEqual([
      {
        source: {
          path: "packages/tokens/src/semantic/color.json",
          tier: "semantic",
          category: "color",
        },
        name: "semantic.color.action.background",
        value: "{base.color.blue.600}",
        type: "color",
        description: undefined,
      },
    ]);
  });
});
