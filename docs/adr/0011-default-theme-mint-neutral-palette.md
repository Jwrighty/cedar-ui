# Default theme palette: mint accent on pure-neutral surfaces

**Supersedes [ADR 0010](0010-default-theme-teal-off-white-palette.md).**

Cedar's default `light` and `dark` themes adopt a mint-green accent on **pure-neutral**
surfaces, derived from two tweakcn reference themes. This replaces 0010's warm
off-white + dark-teal direction, which had two problems in practice: the light page
read with a brown/green tint rather than a clean off-white, and the accent collapsed to
a deep, un-teal green because it was expressed as dark *text* on light surfaces.

The fix is a different expression of the accent: the primary is a **bright mint fill
(`#72e3ad`) with near-black text on it** in both themes, so the accent reads as vivid
mint/teal rather than dark-green text. Surfaces are pure neutral grey (no warmth);
dark mode is near-black (`#121212`), not warm charcoal.

Scope is **colours only** — radius (0.5rem), fonts, and shadows are unchanged. The
`cedar` brand theme remains a distinct amber alternate (it now sits on the new neutral
surfaces, which is the intended re-theming demo).

## Base ramps

The `warm` ramp from 0010 is removed. Two ramps drive the palette (existing
`blue/green/red/amber/violet/cyan` ramps remain for status and charts):

**`teal`** — redefined mint-forward (was anchored on `#1d9e75`):

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `#f0fdf8` | `#d9f9e9` | `#aaf0cf` | `#72e3ad` | `#3fd293` | `#15b377` | `#0f9466` | `#147a54` | `#0e5c40` | `#1e2723` |

`300` is the primary fill; `900` is the near-black text on that fill; `700` is the
AA-safe accent/link text on light; `500` is the focus ring.

**`neutral`** — pure grey, near-white → near-black:

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 850 | 900 | 950 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `#fcfcfc` | `#f6f6f6` | `#ededed` | `#dfdfdf` | `#b0b0b0` | `#808080` | `#525252` | `#3b3b3b` | `#292929` | `#1f1f1f` | `#171717` | `#121212` |

## Semantic mapping

- **Light (`:root`)**: page `neutral.50`, raised `white`, sunken `neutral.200`; text
  `neutral.900` / muted `neutral.600`; **action fill `teal.300` with `teal.900` label**;
  hover `teal.400`, active `teal.500`, subtle `teal.50`; accent/link text `teal.700`;
  border `neutral.300` / `neutral.400`; focus-ring `teal.500`.
- **Dark**: page `neutral.950` (`#121212`), raised `neutral.900`, sunken `neutral.850`;
  text `neutral.100` / muted `neutral.400`; **the same bright `teal.300` fill with
  `teal.900` label** (fixing the reference's dull `#006239` dark accent); accent/link
  text `teal.300`; borders `neutral.800` / `neutral.700`; focus-ring `teal.400`.

## WCAG AA

All normal-weight text clears AA. Mint fill + near-black label = 9.72:1 (both themes);
light body 17.5:1, muted 7.6:1; light accent/link text (`teal.700`) 5.2:1; dark body
15:1, muted 7.3:1, mint link 11.9:1; danger text/fill ≈ 4.7–5:1.

Two deliberate deviations from a literal reference match:

- **Charts**: the references' bright mint/amber/green are sub-3:1 on near-white (near
  invisible). Light charts therefore use the darker `600` steps (all ≥ 3:1 as graphical
  marks); dark charts use the bright steps. Hues match the reference; lightness adapts to
  the surface.
- **Danger** keeps Cedar's existing red (`#dc2626` rest), already AA, rather than the
  reference's `#ca3214` — avoids churn; trivially swappable.

## Status

Status keeps green/amber/red identities. Light pills use `50`-tint surfaces + `700`
foregrounds (AA against the new near-white). Dark pills use a `neutral.850` tint with
`400` foregrounds (carried over from 0010's AA fix, re-based off the neutral ramp).

## Consequences

- `text.on-action` is now a dark colour, not white — primary buttons, the checkbox
  check, etc. render dark-on-mint. Components already consume the semantic token, so no
  component code changes.
- The `warm` base ramp is removed; nothing else referenced it.
