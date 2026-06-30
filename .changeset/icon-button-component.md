---
"@jwrighty/cedar-react": minor
---

Add `IconButton`, a square icon-only button built on React Aria Components. It
owns its square geometry and scales its icon child to the control size (sm 16,
md 20, lg 24), and requires `aria-label` at the type level since an icon has no
accessible name on its own. Unlike `Button`, the `ghost` and `secondary`
variants are neutral (text colour, not the accent) because icon-only controls
are usually chrome rather than the primary action.
