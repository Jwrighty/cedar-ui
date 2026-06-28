import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildComponentCatalog,
  renderLlmsTxt,
  renderManifest,
  renderManifestSchema,
} from "./agent-surface.mjs";

test("renders llms.txt from component metadata", () => {
  const rendered = renderLlmsTxt([
    {
      name: "Button",
      exports: ["Button"],
      meta: {
        summary: "Triggers an action.",
        useWhen: ["A user confirms something."],
        avoidWhen: [{ situation: "Navigating somewhere", useInstead: "Link" }],
        a11yNotes: ["Keyboard activation is supported."],
        relatedComponents: ["Link"],
        status: "experimental",
      },
    },
  ]);

  assert.match(rendered, /^# Cedar/m);
  assert.match(rendered, /Generated from co-located `ComponentMeta`/i);
  assert.match(rendered, /\[Glossary and domain language\]\(CONTEXT\.md\)/);
  assert.match(rendered, /\[Token reference\]\(packages\/tokens\/README\.md\)/);
  assert.match(rendered, /### Button/);
  assert.match(rendered, /\*\*Summary:\*\* Triggers an action\./);
  assert.match(rendered, /\*\*Use when:\*\* A user confirms something\./);
  assert.match(
    rendered,
    /\*\*Avoid when:\*\* Navigating somewhere; use Link instead\. \(Link not currently listed in Cedar public components\.\)/,
  );
  assert.match(
    rendered,
    /\*\*Accessibility:\*\* Keyboard activation is supported\./,
  );
});

test("fails when required metadata exports are missing from the package build", () => {
  assert.throws(
    () =>
      buildComponentCatalog({
        Badge() {},
        StatusPill() {},
        Box() {},
        Button() {},
        badgeMeta: {
          summary: "Labels status.",
          useWhen: [],
          avoidWhen: [],
          a11yNotes: [],
          relatedComponents: [],
          status: "experimental",
        },
        buttonMeta: {
          summary: "Triggers an action.",
          useWhen: [],
          avoidWhen: [],
          a11yNotes: [],
          relatedComponents: [],
          status: "experimental",
        },
      }),
    /Missing metadata export: boxMeta/,
  );
});

test("fails when a public component export is missing from the catalog", () => {
  const meta = {
    summary: "Test metadata.",
    useWhen: [],
    avoidWhen: [],
    a11yNotes: [],
    relatedComponents: [],
    status: "experimental",
  };

  assert.throws(
    () =>
      buildComponentCatalog({
        Badge() {},
        Box() {},
        Button() {},
        Card() {},
        CardBody() {},
        CardFooter() {},
        CardHeader() {},
        Checkbox() {},
        Dialog() {},
        Heading() {},
        Inline() {},
        MetricCard() {},
        Popover() {},
        Radio() {},
        RadioGroup() {},
        Skeleton() {},
        Stack() {},
        Stat() {},
        StatusPill() {},
        Switch() {},
        Tabs() {},
        Table() {},
        TableCell() {},
        TableHeaderCell() {},
        TableRow() {},
        Text() {},
        TextField() {},
        Tooltip() {},
        UnlistedComponent() {},
        badgeMeta: meta,
        boxMeta: meta,
        buttonMeta: meta,
        cardMeta: meta,
        checkboxMeta: meta,
        dialogMeta: meta,
        headingMeta: meta,
        inlineMeta: meta,
        skeletonMeta: meta,
        popoverMeta: meta,
        radioGroupMeta: meta,
        stackMeta: meta,
        statMeta: meta,
        switchMeta: meta,
        tabsMeta: meta,
        tableMeta: meta,
        textMeta: meta,
        textFieldMeta: meta,
        tooltipMeta: meta,
      }),
    /Agent component catalog is missing public exports: UnlistedComponent/,
  );
});

test("renders a manifest from component metadata, props, variants, and tokens", () => {
  const manifest = renderManifest({
    componentCatalog: [
      {
        name: "Button",
        exports: ["Button"],
        meta: {
          summary: "Triggers an action.",
          useWhen: ["A user confirms something."],
          avoidWhen: [
            { situation: "Navigating somewhere", useInstead: "Link" },
          ],
          a11yNotes: ["Keyboard activation is supported."],
          relatedComponents: ["Link"],
          status: "experimental",
        },
      },
    ],
    componentDocs: {
      Button: {
        source: "packages/react/src/Button.tsx",
        props: [
          {
            typeName: "ButtonProps",
            kind: "interface",
            exported: true,
            extends: ["AriaButtonProps"],
            properties: [
              {
                name: "variant",
                type: 'ButtonVariants["variant"]',
                required: false,
                default: '"primary"',
                description: "Visual emphasis.",
              },
            ],
          },
        ],
        variants: [{ name: "variant", options: ["primary", "secondary"] }],
      },
    },
    tokenSources: [
      {
        path: "packages/tokens/src/base/color.json",
        tier: "base",
        category: "color",
        tokens: { blue: { 500: { $value: "#006adc" } } },
      },
    ],
    packages: {
      react: { name: "@jwrighty/cedar-react", version: "0.2.0" },
      tokens: { name: "@jwrighty/cedar-tokens", version: "0.2.0" },
    },
  });

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.components[0].name, "Button");
  assert.deepEqual(manifest.components[0].variants[0].options, [
    "primary",
    "secondary",
  ]);
  assert.equal(
    manifest.components[0].props[0].properties[0].default,
    '"primary"',
  );
  assert.equal(manifest.tokens.sources[0].tier, "base");
});

test("renders a schema for the manifest contract", () => {
  const schema = renderManifestSchema();

  assert.equal(schema.title, "Cedar agent manifest");
  assert.deepEqual(schema.required, [
    "schemaVersion",
    "name",
    "packages",
    "generatedFrom",
    "components",
    "tokens",
  ]);
  assert.ok(schema.$defs.component);
  assert.ok(schema.$defs.prop);
});
