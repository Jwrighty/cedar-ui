---
"@jwrighty/cedar-react": minor
---

`Stat` now places the optional delta on the label row (right-aligned) instead of
beside the value. The value gets its own full-width row below, so large values no
longer wrap mid-token or collide with the delta at narrow card widths. The
internal `valueRow` wrapper is replaced by a `header` row containing the label and
delta.
