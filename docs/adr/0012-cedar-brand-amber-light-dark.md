# Cedar brand theme: amber light + dark variants

The `cedar` brand theme is split into a **`cedar-light`** / **`cedar-dark`** pair and
re-pointed to a bright amber accent, derived from a tweakcn amber reference. This
mirrors the bright-fill expression adopted for the default themes in
[ADR 0011](0011-default-theme-mint-neutral-palette.md): the accent is a vivid amber
**fill** with a near-black label, not dark amber *text*.

## Why a pair

Themes are applied through a single `[data-theme]` attribute (`dark`, `cedar-*`), not
composable classes, so `cedar` could not stack with `dark`. The old `cedar` was a
partial override that inherited `:root`'s light surfaces — it only ever read as a light
theme. To offer the brand in dark mode, the brand needs its own full dark block.

- **`cedar-light`** — a partial override on the default light (`:root`) neutral
  surfaces; only the amber accent, status, chart, and focus tokens change.
- **`cedar-dark`** — a full block: the default dark theme's neutral surfaces/text/
  borders (`neutral.950/900/850`, near-black `#121212` page) with the amber accent
  swapped in for teal.

The previous single `cedar` theme (`[data-theme="cedar"]`) is renamed to `cedar-light`;
`build.js`, the Storybook toolbar, the Switch/Palette stories, and the tokens tests are
updated to the new names.

## Base ramp

The `amber` ramp gains two steps (existing `50/400/500/600/700` unchanged):

| 50 | 300 | 400 | 500 | 600 | 700 | 800 |
|----|-----|-----|-----|-----|-----|-----|
| `#fdf3e7` | `#fbbf24` | `#f59e0b` | `#d97706` | `#b45309` | `#92400e` | `#78350f` |

`400` is the primary fill (the reference's `#f59e0b`); `300` is the bright accent/link
and hover step on dark; `700` is the AA accent/link text on light; `800` is reserved for
chart depth.

## Semantic mapping

- **`cedar-light`**: action fill `amber.400` with a `neutral.900` (near-black) label;
  hover `amber.500`, active `amber.600`, subtle `amber.50`; accent/link text `amber.700`;
  focus-ring `amber.500`. Surfaces, body, and borders inherit the light `:root`.
- **`cedar-dark`**: page `neutral.950`, raised `neutral.900`, sunken `neutral.850`; text
  `neutral.100` / muted `neutral.400`; **the same bright `amber.400` fill with a
  `neutral.900` label**; hover `amber.300`, active `amber.500`, subtle `neutral.800`;
  accent/link text `amber.300`; borders `neutral.800` / `neutral.700`; focus-ring
  `amber.400`.

## WCAG AA

Near-black (`neutral.900`) on the amber `400` fill ≈ 9.7:1 in both themes. Light
accent/link text (`amber.700`) ≈ 4.9:1 on the near-white page; dark accent/link
(`amber.300`) ≈ 11:1 on the near-black page. Status pills follow ADR 0011 (light
`50`-tint + `700` foregrounds; dark `neutral.850` tint + `400` foregrounds).

Deliberate deviations from a literal reference match:

- **Charts** stay multi-hue and distinct rather than collapsing to the reference's
  single-amber ramp — categorical series need hue separation. Cedar leads with amber
  (`600` on light, `400` on dark) and keeps blue/green/violet/cyan/red, lightness
  adapting to the surface (same rationale as ADR 0011).
- **Danger** keeps Cedar's existing red, already AA, rather than the reference's
  `#ef4444` everywhere.

## Consequences

- Consumers selecting `[data-theme="cedar"]` must move to `cedar-light` (or
  `cedar-dark`). This is the only breaking change.
- `text.on-action` in cedar is a dark colour, matching the default themes — primary
  buttons render dark-on-amber. Components already consume the semantic token, so no
  component code changes.
- Scope is colours only — radius, fonts, and shadows are unchanged.
