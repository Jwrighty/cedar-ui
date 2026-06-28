import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

import { tokens } from "../dist/index.js";

const css = readFileSync(
  new URL("../dist/tokens.css", import.meta.url),
  "utf8",
);

test("observe motion tokens are exposed as semantic CSS variables and typed exports", () => {
  assert.equal(tokens.base.motion.duration.fast, "120ms");
  assert.equal(tokens.semantic.motion.duration.settle, "180ms");
  assert.equal(
    tokens.semantic.motion.easing.settle,
    "cubic-bezier(0.16, 1, 0.3, 1)",
  );

  assert.match(
    css,
    /--semantic-motion-duration-settle:\s*var\(--base-motion-duration-base\)/,
  );
  assert.match(css, /--semantic-motion-easing-emphasized:/);
});

test("observe status and chart colour tokens are themeable and exported", () => {
  // Status keeps its green identity, distinct from the teal accent.
  assert.equal(tokens.semantic.color.status.success.foreground, "#047857");
  // Chart palette is teal-led after the default-theme palette change.
  assert.equal(tokens.semantic.color.chart.categorical.one, "#168a64");

  assert.match(css, /--semantic-color-status-running-foreground:/);
  assert.match(css, /--semantic-color-chart-categorical-six:/);
  assert.match(
    css,
    /\[data-theme="dark"\][\s\S]*--semantic-color-status-success-foreground:/,
  );
  assert.match(
    css,
    /\[data-theme="cedar"\][\s\S]*--semantic-color-status-running-foreground:/,
  );
});

test("teal accent and warm neutral base ramps exist", () => {
  // Brand anchor and the steps the semantic layer leans on.
  assert.equal(tokens.base.color.teal["500"], "#1d9e75");
  assert.equal(tokens.base.color.teal["700"], "#15795a");
  assert.equal(tokens.base.color.teal["400"], "#38bd93");
  assert.equal(tokens.base.color.warm["50"], "#fbfaf8");
  assert.equal(tokens.base.color.warm["100"], "#f5f3ef");
  assert.equal(tokens.base.color.warm["900"], "#1c1a17");

  assert.match(css, /--base-color-teal-500:\s*#1d9e75/);
  assert.match(css, /--base-color-warm-100:\s*#f5f3ef/);
});

test("default light theme is warm off-white surfaces with a teal accent", () => {
  // outputReferences keeps the base<-semantic relationship in the CSS.
  assert.match(
    css,
    /--semantic-color-surface-page:\s*var\(--base-color-warm-100\)/,
  );
  assert.match(
    css,
    /--semantic-color-surface-raised:\s*var\(--base-color-warm-50\)/,
  );
  assert.match(
    css,
    /--semantic-color-action-rest:\s*var\(--base-color-teal-700\)/,
  );
  assert.match(
    css,
    /--semantic-color-text-accent:\s*var\(--base-color-teal-700\)/,
  );
  // Typed exports reflect the light/default theme.
  assert.equal(tokens.semantic.color.action.rest, "#15795a");
  assert.equal(tokens.semantic.color.surface.page, "#f5f3ef");
});

test("dark theme keeps the teal identity, lightened for dark surfaces", () => {
  assert.match(
    css,
    /\[data-theme="dark"\][\s\S]*--semantic-color-surface-page:\s*var\(--base-color-warm-900\)/,
  );
  assert.match(
    css,
    /\[data-theme="dark"\][\s\S]*--semantic-color-action-rest:\s*var\(--base-color-teal-400\)/,
  );
});

test("dark status pills use a subtle neutral tint with AA foregrounds", () => {
  // Lighter 400 steps exist for the dark status foregrounds.
  assert.equal(tokens.base.color.green["400"], "#34d399");
  assert.equal(tokens.base.color.amber["400"], "#f59e0b");
  assert.equal(tokens.base.color.red["400"], "#f87171");
  // Dark status surfaces are the neutral card tint, not a same-hue fill,
  // so the bright foreground clears AA (the cedar/01 dark pills did not).
  const darkStatus = css.match(/\[data-theme="dark"\][\s\S]*$/)[0];
  assert.match(
    darkStatus,
    /--semantic-color-status-success-foreground:\s*var\(--base-color-green-400\)/,
  );
  assert.match(
    darkStatus,
    /--semantic-color-status-success-surface:\s*var\(--base-color-warm-800\)/,
  );
});

test("chart palette is teal-led and drops green", () => {
  const categorical = Object.values(tokens.semantic.color.chart.categorical);
  // green.600 (#059669) must not appear — green is reserved for success status.
  assert.ok(!categorical.includes("#059669"));
  assert.equal(tokens.semantic.color.chart.categorical.one, "#168a64"); // teal
});
