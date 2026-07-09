# @jwrighty/cedar-tokens

## 0.4.1

### Patch Changes

- c8d3572: Improve ds-bench coverage with alias canonical examples and typed motion tokens.

## 0.4.0

### Minor Changes

- a3dd641: Refine motion tokens for calmer, dashboard-appropriate animation.

  - Remove overshoot from the default chart/enter easing: `semantic.motion.easing.emphasized` now resolves to a new non-bouncy `decelerate` curve (`cubic-bezier(0.05, 0.7, 0.1, 1)`). This fixes scaled chart marks briefly rendering past their container bounds.
  - Add `semantic.motion.easing.playful` (the former overshoot curve) so the bouncy easing stays available for genuine micro-interactions.
  - Slow down motion slightly across the board: `base` 180ms→220ms, `fast` 120ms→140ms, `slow` 320ms→360ms.
  - Add a dedicated `base.motion.duration.draw` (600ms) for chart draw-on animations; `semantic.motion.duration.draw` now points at it.

## 0.3.0

### Minor Changes

- ce0d017: Split the `cedar` brand theme into a `cedar-light` / `cedar-dark` pair and re-point it
  to a bright amber accent (`#f59e0b` fill with a near-black label) matching the default
  themes' bright-fill expression. `cedar-light` keeps the light neutral surfaces and only
  swaps the accent; `cedar-dark` is a full block on the near-black neutral surfaces. Adds
  `amber.300`/`amber.800` base steps. **Breaking:** `[data-theme="cedar"]` is renamed to
  `[data-theme="cedar-light"]`. See ADR 0012.
- 33d97eb: Add an `xl` (24px) step across the spacing scale (`inset`, `stack`, and `gap`)
  and the `Card` `padding` variant. `Stat` now accepts a `padding` prop (forwarded
  to `Card`) and defaults to `xl` for a roomier metric surface.
- a20cce4: Redefine the default light and dark themes: a bright mint accent (`#72e3ad` fill
  with near-black label) on pure-neutral surfaces — near-white in light, near-black
  (`#121212`) in dark. Adds a `neutral` base ramp, re-points the `teal` ramp
  mint-forward, removes the `warm` ramp, makes `text.on-action` dark, keeps the
  chart palette mint-led (visible 600 steps on light, bright on dark), and keeps
  status/danger AA in both themes. See ADR 0011.

### Patch Changes

- 62b30d4: Add Observe-oriented Card, Skeleton, Badge, Stat, and table presentation primitives.
- c288538: Add observe foundation tokens for motion, status colours, and chart palettes.

## 0.2.0

### Minor Changes

- 77dd93f: Add the accessible, themeable Checkbox primitive and its component tokens.
- e6ca8b4: Add the accessible, themeable RadioGroup and Radio primitives with component tokens.
- 26b1f14: Add the accessible Switch primitive and its theme-aware component tokens.
- 02a7f40: Add the accessible, token-styled Popover compound primitive and its surface tokens.
- deda052: Add polymorphic Box, Stack, and Inline layout primitives with semantic spacing tokens.
- 248f533: Add the Tabs primitive with themed component tokens.
- 44776a8: Add themeable Text and Heading typography primitives with semantic type-scale tokens.
- 1868fc7: Add the accessible, themeable Tooltip primitive and its component tokens.

## 0.1.0

### Minor Changes

- 10aaf39: Initial public release of the Cedar walking skeleton.

  - `@jwrighty/cedar-tokens`: neutral DTCG token source compiled to CSS custom
    properties (`tokens.css`) and typed TS exports, tiered `base → semantic →
component`, with light / dark / brand themes driven by `[data-theme]`.
  - `@jwrighty/cedar-react`: accessible, themeable **Button**, **TextField**, and
    **Dialog** built on React Aria Components, shipping an importable `styles.css`
    and preserving `"use client"` for RSC consumers.
