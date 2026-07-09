import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildComponentCatalog,
  buildTemplateCatalog,
  renderConsumerAgentRules,
  renderLlmsTxt,
  renderManifest,
  renderManifestSchema,
} from "./agent-surface.mjs";

test("renders llms.txt from component metadata", () => {
  const rendered = renderLlmsTxt(
    [
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
        canonicalExample: {
          source: "packages/react/src/canonical-examples.tsx#ButtonExample",
          code: "function ButtonExample() {\n  return <Button>Save</Button>;\n}",
        },
        exportExamples: {
          Button: {
            source: "packages/react/src/canonical-examples.tsx#ButtonExample",
            code: "function ButtonExample() {\n  return <Button>Save</Button>;\n}",
          },
        },
      },
      {
        name: "Badge",
        exports: ["Badge", "StatusPill"],
        meta: {
          summary: "Labels status.",
          useWhen: ["A compact status label is needed."],
          avoidWhen: [],
          a11yNotes: ["Text remains visible."],
          relatedComponents: [],
          status: "experimental",
        },
        canonicalExample: {
          source: "packages/react/src/canonical-examples.tsx#BadgeExample",
          code: 'function BadgeExample() {\n  return <Badge>Status</Badge>;\n}',
        },
        exportExamples: {
          Badge: {
            source: "packages/react/src/canonical-examples.tsx#BadgeExample",
            code: 'function BadgeExample() {\n  return <Badge>Status</Badge>;\n}',
          },
          StatusPill: {
            source:
              "packages/react/src/canonical-examples.tsx#StatusPillExample",
            code: 'function StatusPillExample() {\n  return <StatusPill>Healthy</StatusPill>;\n}',
          },
        },
      },
    ],
    [
      {
        id: "form-dialog",
        summary: "Collects a short form in a modal.",
        useWhen: ["A user edits a focused set of fields."],
        components: ["Dialog", "TextField", "Inline"],
        skeleton:
          "<Dialog.Root>\n  <Dialog.Trigger>Open</Dialog.Trigger>\n</Dialog.Root>",
        status: "experimental",
        canonicalExample: {
          source:
            "packages/react/src/composition-templates.tsx#FormDialogTemplateExample",
          code: "function FormDialogTemplateExample() {\n  return <Dialog.Root />;\n}",
        },
      },
    ],
  );

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
  assert.match(rendered, /\*\*Canonical example:\*\*/);
  assert.match(rendered, /```tsx\nfunction ButtonExample\(\)/);
  assert.match(rendered, /### Badge/);
  assert.match(rendered, /\*\*StatusPill example:\*\*/);
  assert.match(rendered, /```tsx\nfunction StatusPillExample\(\)/);
  assert.match(rendered, /## Composition Templates/);
  assert.match(rendered, /### form-dialog/);
  assert.match(rendered, /\*\*Components:\*\* `Dialog`, `TextField`, `Inline`/);
  assert.match(rendered, /\*\*Skeleton:\*\*/);
  assert.match(rendered, /```tsx\nfunction FormDialogTemplateExample\(\)/);
});

test("renders generated consumer agent rules for supported targets", () => {
  const rules = renderConsumerAgentRules({
    packages: {
      react: { name: "@jwrighty/cedar-react", version: "0.3.0" },
      tokens: { name: "@jwrighty/cedar-tokens", version: "0.3.0" },
      mcp: {
        name: "@jwrighty/cedar-mcp",
        version: "0.2.1",
        command: "cedar-mcp",
      },
    },
  });

  assert.deepEqual(
    rules.map((rule) => rule.fileName),
    ["CLAUDE.md", ".cursorrules", "AGENTS.md"],
  );
  assert.match(rules[0].content, /^# CLAUDE\.md for Cedar consumers/m);
  assert.match(rules[1].content, /^# \.cursorrules for Cedar consumers/m);
  assert.match(rules[2].content, /^# AGENTS\.md for Cedar consumers/m);

  for (const rule of rules) {
    assert.match(
      rule.content,
      /generated rules for projects that consume Cedar/i,
    );
    assert.match(
      rule.content,
      /Do not confuse it with Cedar's repo-internal contributor `AGENTS\.md`/,
    );
    assert.match(
      rule.content,
      /Import Cedar React components only from `@jwrighty\/cedar-react`/,
    );
    assert.match(
      rule.content,
      /Import Cedar token utilities only from `@jwrighty\/cedar-tokens`/,
    );
    assert.match(rule.content, /Do not use inline styles/);
    assert.match(rule.content, /Use Cedar tokens instead of magic values/);
    assert.match(rule.content, /Use `onPress`, not `onClick`/);
    assert.match(rule.content, /Use `isDisabled`, not `disabled`/);
    assert.match(rule.content, /generated `llms\.txt`/);
    assert.match(rule.content, /MCP server from `@jwrighty\/cedar-mcp`/);
    assert.match(rule.content, /"command": "cedar-mcp"/);
  }
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
        IconButton() {},
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
        Toast() {},
        UnlistedComponent() {},
        badgeMeta: meta,
        boxMeta: meta,
        buttonMeta: meta,
        cardMeta: meta,
        checkboxMeta: meta,
        dialogMeta: meta,
        headingMeta: meta,
        iconButtonMeta: meta,
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
        toastMeta: meta,
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
        canonicalExample: {
          source: "packages/react/src/canonical-examples.tsx#ButtonExample",
          code: "function ButtonExample() {\n  return <Button>Save</Button>;\n}",
        },
        exportExamples: {
          Button: {
            source: "packages/react/src/canonical-examples.tsx#ButtonExample",
            code: "function ButtonExample() {\n  return <Button>Save</Button>;\n}",
          },
        },
      },
    ],
    templateCatalog: [
      {
        id: "form-dialog",
        summary: "Collects a short form in a modal.",
        useWhen: ["A user edits a focused set of fields."],
        components: ["Dialog", "TextField", "Inline"],
        skeleton:
          "<Dialog.Root>\n  <Dialog.Trigger>Open</Dialog.Trigger>\n</Dialog.Root>",
        status: "experimental",
        canonicalExample: {
          source:
            "packages/react/src/composition-templates.tsx#FormDialogTemplateExample",
          code: "function FormDialogTemplateExample() {\n  return <Dialog.Root />;\n}",
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
  assert.equal(manifest.templates[0].id, "form-dialog");
  assert.deepEqual(manifest.templates[0].components, [
    "Dialog",
    "TextField",
    "Inline",
  ]);
  assert.deepEqual(manifest.templates[0].canonicalExample, {
    source:
      "packages/react/src/composition-templates.tsx#FormDialogTemplateExample",
    code: "function FormDialogTemplateExample() {\n  return <Dialog.Root />;\n}",
  });
  assert.deepEqual(manifest.components[0].canonicalExample, {
    source: "packages/react/src/canonical-examples.tsx#ButtonExample",
    code: "function ButtonExample() {\n  return <Button>Save</Button>;\n}",
  });
  assert.deepEqual(manifest.components[0].exportExamples.Button, {
    source: "packages/react/src/canonical-examples.tsx#ButtonExample",
    code: "function ButtonExample() {\n  return <Button>Save</Button>;\n}",
  });
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
    "templates",
    "tokens",
  ]);
  assert.ok(schema.$defs.component);
  assert.ok(schema.$defs.template);
  assert.ok(
    schema.$defs.component.required.includes("canonicalExample"),
    "component entries require a canonical example",
  );
  assert.ok(
    schema.$defs.template.required.includes("canonicalExample"),
    "template entries require a canonical example",
  );
  assert.equal(
    schema.$defs.component.properties.canonicalExample.$ref,
    "#/$defs/canonicalExample",
  );
  assert.deepEqual(
    schema.$defs.component.properties.exportExamples.additionalProperties,
    { $ref: "#/$defs/canonicalExample" },
  );
  assert.equal(
    schema.$defs.template.properties.canonicalExample.$ref,
    "#/$defs/canonicalExample",
  );
  assert.ok(schema.$defs.prop);
});

test("builds a template catalog from package metadata and tested examples", () => {
  const catalog = buildTemplateCatalog(
    {
      compositionTemplates: [
        {
          id: "form-dialog",
          summary: "Collects a short form in a modal.",
          useWhen: ["A user edits a focused set of fields."],
          components: ["Dialog", "TextField", "Inline"],
          skeleton: "<Dialog.Root />",
          status: "experimental",
        },
      ],
    },
    {
      "form-dialog": {
        source:
          "packages/react/src/composition-templates.tsx#FormDialogTemplateExample",
        code: "function FormDialogTemplateExample() {\n  return <Dialog.Root />;\n}",
      },
    },
  );

  assert.deepEqual(catalog[0].canonicalExample, {
    source:
      "packages/react/src/composition-templates.tsx#FormDialogTemplateExample",
    code: "function FormDialogTemplateExample() {\n  return <Dialog.Root />;\n}",
  });
});

test("fails when template examples are missing", () => {
  assert.throws(
    () =>
      buildTemplateCatalog(
        {
          compositionTemplates: [
            {
              id: "form-dialog",
              summary: "Collects a short form in a modal.",
              useWhen: [],
              components: ["Dialog"],
              skeleton: "<Dialog.Root />",
              status: "experimental",
            },
          ],
        },
        {},
      ),
    /Agent template catalog is missing canonical examples: form-dialog/,
  );
});
