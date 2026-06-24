import assert from "node:assert/strict";
import { test } from "node:test";
import { buildComponentCatalog, renderLlmsTxt } from "./agent-surface.mjs";

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
        Box() {},
        Button() {},
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
        Box() {},
        Button() {},
        Checkbox() {},
        Dialog() {},
        Heading() {},
        Inline() {},
        Popover() {},
        Radio() {},
        RadioGroup() {},
        Stack() {},
        Switch() {},
        Tabs() {},
        Text() {},
        TextField() {},
        Tooltip() {},
        UnlistedComponent() {},
        boxMeta: meta,
        buttonMeta: meta,
        checkboxMeta: meta,
        dialogMeta: meta,
        headingMeta: meta,
        inlineMeta: meta,
        popoverMeta: meta,
        radioGroupMeta: meta,
        stackMeta: meta,
        switchMeta: meta,
        tabsMeta: meta,
        textMeta: meta,
        textFieldMeta: meta,
        tooltipMeta: meta,
      }),
    /Agent component catalog is missing public exports: UnlistedComponent/,
  );
});
