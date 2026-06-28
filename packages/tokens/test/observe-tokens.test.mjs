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
  // Status keeps its green identity, distinct from the mint accent.
  assert.equal(tokens.semantic.color.status.success.foreground, "#047857");
  // Chart palette is teal/mint-led; on light it uses the visible 600 step.
  assert.equal(tokens.semantic.color.chart.categorical.one, "#0f9466");

  assert.match(css, /--semantic-color-status-running-foreground:/);
  assert.match(css, /--semantic-color-chart-categorical-six:/);
  assert.match(
    css,
    /\[data-theme="dark"\][\s\S]*--semantic-color-status-success-foreground:/,
  );
  assert.match(
    css,
    /\[data-theme="cedar-light"\][\s\S]*--semantic-color-status-running-foreground:/,
  );
});

test("cedar brand themes express a bright amber fill on light and dark surfaces", () => {
  // Amber ramp gained a bright 300 (dark accent/link) and a deep 800 step.
  assert.equal(tokens.base.color.amber["300"], "#fbbf24");
  assert.equal(tokens.base.color.amber["400"], "#f59e0b");
  assert.equal(tokens.base.color.amber["800"], "#78350f");
  assert.match(css, /--base-color-amber-300:\s*#fbbf24/);
  assert.match(css, /--base-color-amber-800:\s*#78350f/);

  // cedar-light: bright amber.400 fill with a near-black label, on the inherited
  // neutral light surfaces; AA accent/link text via amber.700.
  const cedarLight = css.match(/\[data-theme="cedar-light"\][\s\S]*?\}/)[0];
  assert.match(
    cedarLight,
    /--semantic-color-action-rest:\s*var\(--base-color-amber-400\)/,
  );
  assert.match(
    cedarLight,
    /--semantic-color-text-on-action:\s*var\(--base-color-neutral-900\)/,
  );
  assert.match(
    cedarLight,
    /--semantic-color-text-accent:\s*var\(--base-color-amber-700\)/,
  );

  // cedar-dark: a full theme block — dark neutral surfaces with the same bright
  // amber fill and a bright amber link.
  const cedarDark = css.match(/\[data-theme="cedar-dark"\][\s\S]*?\}/)[0];
  assert.match(
    cedarDark,
    /--semantic-color-surface-page:\s*var\(--base-color-neutral-950\)/,
  );
  assert.match(
    cedarDark,
    /--semantic-color-action-rest:\s*var\(--base-color-amber-400\)/,
  );
  assert.match(
    cedarDark,
    /--semantic-color-text-accent:\s*var\(--base-color-amber-300\)/,
  );
});

test("mint accent and neutral base ramps exist", () => {
  // Mint-forward accent ramp: 300 is the bright fill, 900 the on-fill text.
  assert.equal(tokens.base.color.teal["300"], "#72e3ad");
  assert.equal(tokens.base.color.teal["700"], "#147a54");
  assert.equal(tokens.base.color.teal["900"], "#1e2723");
  // Pure-neutral surfaces ramp (no warm tint); the warm ramp is gone.
  assert.equal(tokens.base.color.neutral["50"], "#fcfcfc");
  assert.equal(tokens.base.color.neutral["900"], "#171717");
  assert.equal(tokens.base.color.neutral["950"], "#121212");
  assert.equal(tokens.base.color.warm, undefined);

  assert.match(css, /--base-color-teal-300:\s*#72e3ad/);
  assert.match(css, /--base-color-neutral-50:\s*#fcfcfc/);
  assert.doesNotMatch(css, /--base-color-warm-/);
});

test("default light theme is near-white neutral surfaces with a mint fill", () => {
  // outputReferences keeps the base<-semantic relationship in the CSS.
  assert.match(
    css,
    /--semantic-color-surface-page:\s*var\(--base-color-neutral-50\)/,
  );
  assert.match(
    css,
    /--semantic-color-surface-raised:\s*var\(--base-color-white\)/,
  );
  // The accent reads as a bright mint fill with near-black label, not deep-green text.
  assert.match(
    css,
    /--semantic-color-action-rest:\s*var\(--base-color-teal-300\)/,
  );
  assert.match(
    css,
    /--semantic-color-text-on-action:\s*var\(--base-color-teal-900\)/,
  );
  // Link/accent text stays AA on near-white via the darker 700 step.
  assert.match(
    css,
    /--semantic-color-text-accent:\s*var\(--base-color-teal-700\)/,
  );
  // Typed exports reflect the light/default theme.
  assert.equal(tokens.semantic.color.action.rest, "#72e3ad");
  assert.equal(tokens.semantic.color.text["on-action"], "#1e2723");
  assert.equal(tokens.semantic.color.surface.page, "#fcfcfc");
});

test("dark theme keeps the bright mint accent on near-black surfaces", () => {
  const dark = css.match(
    /\[data-theme="dark"\][\s\S]*?(?=\n\n\[data-theme="cedar"\]|$)/,
  )[0];
  assert.match(
    dark,
    /--semantic-color-surface-page:\s*var\(--base-color-neutral-950\)/,
  );
  // Same bright mint fill as light (not a dull dark green).
  assert.match(
    dark,
    /--semantic-color-action-rest:\s*var\(--base-color-teal-300\)/,
  );
  assert.match(
    dark,
    /--semantic-color-text-accent:\s*var\(--base-color-teal-300\)/,
  );
  // Component aliases are re-declared inside the theme so Text/Heading variants
  // resolve against the local semantic theme, not the inherited :root value.
  assert.match(
    dark,
    /--component-text-color-default:\s*var\(--semantic-color-text-default\)/,
  );
  assert.match(
    dark,
    /--component-heading-color-default:\s*var\(--semantic-color-text-default\)/,
  );
});

test("dark status pills use a subtle neutral tint with AA foregrounds", () => {
  // Lighter 400 steps exist for the dark status foregrounds.
  assert.equal(tokens.base.color.green["400"], "#34d399");
  assert.equal(tokens.base.color.amber["400"], "#f59e0b");
  assert.equal(tokens.base.color.red["400"], "#f87171");
  // Dark status surfaces are the neutral card tint, not a same-hue fill,
  // so the bright foreground clears AA.
  const dark = css.match(
    /\[data-theme="dark"\][\s\S]*?(?=\n\n\[data-theme="cedar"\]|$)/,
  )[0];
  assert.match(
    dark,
    /--semantic-color-status-success-foreground:\s*var\(--base-color-green-400\)/,
  );
  assert.match(
    dark,
    /--semantic-color-status-success-surface:\s*var\(--base-color-neutral-850\)/,
  );
});

test("chart palette is mint-led; visible 600 steps on light, bright on dark", () => {
  assert.equal(tokens.semantic.color.chart.categorical.one, "#0f9466"); // mint 600
  assert.equal(tokens.semantic.color.chart.categorical.five, "#059669"); // green
  // Dark charts switch to the bright mint 300 lead.
  const dark = css.match(
    /\[data-theme="dark"\][\s\S]*?(?=\n\n\[data-theme="cedar"\]|$)/,
  )[0];
  assert.match(
    dark,
    /--semantic-color-chart-categorical-one:\s*var\(--base-color-teal-300\)/,
  );
});
