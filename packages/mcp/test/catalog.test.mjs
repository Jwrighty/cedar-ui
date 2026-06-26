import assert from "node:assert/strict";
import test from "node:test";
import {
  getComponentUsage,
  getTokens,
  listComponents,
} from "../dist/index.js";

const manifest = {
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

test("lists component names and summaries", () => {
  assert.deepEqual(listComponents(manifest), [
    {
      name: "Button",
      summary: "A pressable action primitive.",
      status: "experimental",
      exports: ["Button"],
    },
  ]);
});

test("returns full usage metadata by component name", () => {
  assert.equal(getComponentUsage(manifest, "button").name, "Button");
});

test("reports available components for unknown usage lookups", () => {
  assert.throws(
    () => getComponentUsage(manifest, "Card"),
    /Unknown Cedar component "Card". Available components: Button./,
  );
});

test("filters tokens by path and value", () => {
  const tokens = getTokens(manifest, "blue.600");

  assert.equal(tokens.sources.length, 1);
  assert.deepEqual(tokens.matches, [
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
