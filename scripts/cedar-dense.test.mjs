import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import {
  findTokenMatches,
  parseArgs,
  renderDenseComponent,
  renderDenseTokens,
} from "./cedar-dense.mjs";

const manifest = {
  packages: {
    react: { name: "@jwrighty/cedar-react", version: "0.3.0" },
    tokens: { name: "@jwrighty/cedar-tokens", version: "0.3.0" },
  },
  components: [
    {
      name: "Button",
      exports: ["Button"],
      status: "experimental",
      summary: "Triggers an action.",
      useWhen: ["A user confirms something."],
      avoidWhen: [{ situation: "Navigating somewhere", useInstead: "Link" }],
      a11yNotes: ["Keyboard activation is supported."],
      relatedComponents: ["Link"],
      canonicalExample: {
        source: "packages/react/src/canonical-examples.tsx#ButtonExample",
        code: "function ButtonExample() {\n  return <Button>Save</Button>;\n}",
      },
      props: [
        {
          typeName: "ButtonProps",
          properties: [
            {
              name: "variant",
              type: '"primary" | "secondary"',
              required: false,
              default: '"primary"',
              description: "Visual emphasis.",
            },
            {
              name: "children",
              type: "ReactNode",
              required: true,
              description: "Button label.",
            },
          ],
        },
      ],
      variants: [{ name: "variant", options: ["primary", "secondary"] }],
    },
  ],
  tokens: {
    sources: [
      {
        path: "packages/tokens/src/base/color.json",
        tier: "base",
        category: "color",
        tokens: {
          base: {
            color: {
              blue: {
                600: {
                  $value: "#2563eb",
                  $type: "color",
                  $description: "Primary blue ramp value.",
                },
              },
            },
          },
        },
      },
    ],
  },
};

test("parses component and token command forms", () => {
  assert.deepEqual(parseArgs(["Button"]).mode, "component");
  assert.equal(parseArgs(["Button"]).target, "Button");
  assert.equal(parseArgs(["component", "Button"]).target, "Button");

  const tokenArgs = parseArgs(["token", "blue.600", "--limit", "3"]);
  assert.equal(tokenArgs.mode, "token");
  assert.equal(tokenArgs.target, "blue.600");
  assert.equal(tokenArgs.limit, 3);
});

test("renders dense component output from the manifest", () => {
  const rendered = renderDenseComponent(manifest, "button");
  const fullEntry = JSON.stringify(manifest.components[0], null, 2);

  assert.match(rendered, /^Cedar component: Button/);
  assert.match(rendered, /Summary: Triggers an action\./);
  assert.match(rendered, /Use when:\n- A user confirms something\./);
  assert.match(
    rendered,
    /Avoid when:\n- Navigating somewhere; use Link instead\./,
  );
  assert.match(
    rendered,
    /Accessibility:\n- Keyboard activation is supported\./,
  );
  assert.match(
    rendered,
    /Key props:\n- ButtonProps.children \(required\): ReactNode/,
  );
  assert.match(
    rendered,
    /ButtonProps.variant: "primary" \| "secondary"; default "primary"/,
  );
  assert.match(
    rendered,
    /Canonical example: packages\/react\/src\/canonical-examples\.tsx#ButtonExample/,
  );
  assert.ok(rendered.length < fullEntry.length * 0.75);
});

test("renders dense token query output from manifest token sources", () => {
  const rendered = renderDenseTokens(manifest, "blue.600");

  assert.match(rendered, /^Cedar tokens: blue\.600/);
  assert.match(rendered, /Matches: 1/);
  assert.match(
    rendered,
    /- base\.color\.blue\.600 = #2563eb \(color; Primary blue ramp value\.\) \[base\/color: packages\/tokens\/src\/base\/color\.json\]/,
  );
});

test("real manifest dense output is materially smaller than source entries", async () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const realManifest = JSON.parse(
    await readFile(path.join(repoRoot, "cedar.manifest.json"), "utf8"),
  );
  const button = realManifest.components.find(
    (component) => component.name === "Button",
  );
  const componentOutput = renderDenseComponent(realManifest, "Button");
  const tokenOutput = renderDenseTokens(realManifest, "blue.600", {
    limit: 6,
  });

  assert.ok(button);
  assert.ok(
    componentOutput.length < JSON.stringify(button, null, 2).length * 0.6,
  );
  assert.ok(
    tokenOutput.length <
      JSON.stringify(realManifest.tokens, null, 2).length * 0.05,
  );
});

test("finds token matches by value and source metadata", () => {
  assert.equal(findTokenMatches(manifest, "#2563eb").length, 1);
  assert.equal(findTokenMatches(manifest, "base/color").length, 1);
  assert.equal(findTokenMatches(manifest, "base").length, 1);
});

test("CLI reads a manifest file and prints dense output", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "cedar-dense-"));
  const manifestPath = path.join(dir, "cedar.manifest.json");

  try {
    await writeFile(manifestPath, JSON.stringify(manifest), "utf8");

    const result = spawnSync(
      process.execPath,
      ["scripts/cedar-dense.mjs", "--manifest", manifestPath, "Button"],
      {
        cwd: path.resolve(import.meta.dirname, ".."),
        encoding: "utf8",
      },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Cedar component: Button/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
