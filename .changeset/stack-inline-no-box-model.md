---
"@jwrighty/cedar-react": minor
---

`Stack` and `Inline` no longer reset their own `margin`/`padding`. Following the
pattern used by Radix Themes, MUI, and Chakra, the layout primitives now own
only flow direction and `gap` — they carry no box-model opinion, so a consumer
`className` (or wrapping context) can set padding without competing with the
primitive's own reset.

Native list spacing for `as="ul"` / `as="ol"` / `as="menu"` is preserved via a
dedicated zero-specificity reset, applied only when the primitive renders as a
list element. This is a no-op for the common `div` case.
