---
"@jwrighty/cedar-tokens": minor
---

Split the `cedar` brand theme into a `cedar-light` / `cedar-dark` pair and re-point it
to a bright amber accent (`#f59e0b` fill with a near-black label) matching the default
themes' bright-fill expression. `cedar-light` keeps the light neutral surfaces and only
swaps the accent; `cedar-dark` is a full block on the near-black neutral surfaces. Adds
`amber.300`/`amber.800` base steps. **Breaking:** `[data-theme="cedar"]` is renamed to
`[data-theme="cedar-light"]`. See ADR 0012.
