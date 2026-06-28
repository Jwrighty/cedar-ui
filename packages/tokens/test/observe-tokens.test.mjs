import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

import { tokens } from "../dist/index.js";

const css = readFileSync(new URL("../dist/tokens.css", import.meta.url), "utf8");

test("observe motion tokens are exposed as semantic CSS variables and typed exports", () => {
  assert.equal(tokens.base.motion.duration.fast, "120ms");
  assert.equal(tokens.semantic.motion.duration.settle, "180ms");
  assert.equal(tokens.semantic.motion.easing.settle, "cubic-bezier(0.16, 1, 0.3, 1)");

  assert.match(css, /--semantic-motion-duration-settle:\s*var\(--base-motion-duration-base\)/);
  assert.match(css, /--semantic-motion-easing-emphasized:/);
});

test("observe status and chart colour tokens are themeable and exported", () => {
  assert.equal(tokens.semantic.color.status.success.foreground, "#047857");
  assert.equal(tokens.semantic.color.chart.categorical.one, "#2563eb");

  assert.match(css, /--semantic-color-status-running-foreground:/);
  assert.match(css, /--semantic-color-chart-categorical-six:/);
  assert.match(css, /\[data-theme="dark"\][\s\S]*--semantic-color-status-success-foreground:/);
  assert.match(css, /\[data-theme="cedar"\][\s\S]*--semantic-color-status-running-foreground:/);
});
