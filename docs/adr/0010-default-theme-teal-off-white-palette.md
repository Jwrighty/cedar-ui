# Default theme palette: teal accent on warm off-white neutrals

> **Superseded by [ADR 0011](0011-default-theme-mint-neutral-palette.md).** The warm
> off-white surfaces read with a brown/green tint and the dark-teal accent looked like
> deep green as text; the default themes were re-pointed to a mint fill on pure-neutral
> surfaces. Kept for history; the AA methodology and the dark-status-pill fix carried
> forward.

Cedar's default `light` and `dark` themes adopt the **observe** visual identity: a
Helicone-adjacent system of warm off-white surfaces on a slightly-greyed page, with a
single **teal** primary accent. The palette lives entirely in `@jwrighty/cedar-tokens`
as theme tokens — Storybook (the portfolio showcase) and the observe app render the
same palette, and no app hardcodes colour.

This supersedes the earlier disliked blue-on-slate default. The `cedar` brand theme is
left as a distinct amber alternate (its redesign is out of scope) — it exists to
demonstrate live re-theming.

## Base ramps

Two new base ramps are added alongside the existing `gray/blue/green/red/amber/violet/cyan`
ramps (which the `cedar` theme and the status palette still reference):

**`teal`** — anchored on the agreed brand hex `#1d9e75` at step 500:

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `#ecfdf6` | `#d0f5e6` | `#a3e9cf` | `#6dd6b3` | `#38bd93` | `#1d9e75` | `#168a64` | `#15795a` | `#0d5240` | `#08362a` |

**`warm`** — low-saturation neutral with hue nudged warm (off-white → near-black):

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `#fbfaf8` | `#f5f3ef` | `#ebe8e1` | `#ddd8cf` | `#b8b1a4` | `#8a8378` | `#6b6560` | `#4a4540` | `#2e2b27` | `#1c1a17` |

## Semantic mapping

- **Light (`:root`)**: page `warm.100`, raised card `warm.50`, sunken `warm.200`; text
  `warm.900` / muted `warm.600`; borders `warm.200` / `warm.300`; accent text & links
  `teal.700`; action rest `teal.700`, hover/active `teal.800`, subtle `teal.50`;
  focus-ring `teal.500`.
- **Dark**: page `warm.900`, raised `warm.800`; text `warm.50` / muted `warm.400`;
  borders `warm.700` / `warm.600`; accent text, links, action rest & focus-ring
  `teal.400` (the same teal identity, lightened for dark surfaces) with dark
  `on-action` text.

## Why these specific steps (WCAG AA)

The brand anchor `#1d9e75` (teal 500) carries white text at only **3.39:1** — fine for
large/bold marks but below AA for normal-weight text. So `action.rest` in light uses the
darker **teal 700 `#15795a`** (white text **5.36:1**, and **4.84:1** as link text on the
warm page — both AA). In dark, accent sits on a dark surface, so **teal 400 `#38bd93`**
is used (**7.33:1** as text on `warm.900`; dark text on it for buttons, **7.33:1**). Body
text contrast is high on both ends (`warm.900` on `warm.100` ≈ 15.7:1; `warm.50` on
`warm.900` ≈ 15.7:1) and muted text clears AA (`warm.600` ≈ 5.2:1 light;
`warm.400` ≈ 8.2:1 dark).

## Status & chart harmonisation

The status palette (running/success/error) keeps its **green / amber / red** identities —
success must stay visually distinct from the teal accent. In **light** the existing
`50`-tint surface + `700` foreground pills already clear AA against the new warm surfaces
(confirmed, no change).

In **dark** the cedar/01 pills used a same-hue `500`-on-`700` fill that was already
failing AA (success `#10b981` on `#047857` ≈ 2.16:1). They are re-modelled to a **subtle
neutral tint** (`warm.800`, matching the dark card) with a brightened **`400`** foreground
and a `500` border. New `400` steps (`green #34d399`, `amber #f59e0b`, `red #f87171`) were
added to the base ramps so every dark status foreground clears AA on `warm.800`
(green 7.3:1, amber 6.6:1, red 5.1:1).

The categorical **chart** palette is re-led by the brand: `chart.one` becomes **teal**,
and the green entry is **dropped** so it can never be confused with teal in small chart
marks (green remains reserved for success status). Order: `teal, blue, violet, amber,
red, cyan`.

## Considered alternatives

- **Use `#1d9e75` directly for `action.rest`** — rejected: fails AA for normal-weight
  button labels (3.39:1). Kept as the brand anchor and for large/decorative use.
- **Keep blue-led charts** — rejected: the brand teal would never appear in data viz.
- **Teal chart series with green retained** — rejected: teal and green read alike in
  small marks.
- **Pure-grey (cool) neutrals** — rejected: the agreed direction is warm off-white;
  cool greys clash with the teal-warm pairing.

## Consequences

- `@jwrighty/cedar-tokens` gets two new base ramps and re-pointed `light`/`dark` semantic
  colour tokens; a changeset accompanies the change.
- Components and apps already consume only semantic tokens, so no component code changes.
- Storybook gains a side-by-side light/dark palette view (the toolbar theme toggle
  already swaps `[data-theme]` live).
