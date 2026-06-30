---
"@jwrighty/cedar-tokens": minor
---

Refine motion tokens for calmer, dashboard-appropriate animation.

- Remove overshoot from the default chart/enter easing: `semantic.motion.easing.emphasized` now resolves to a new non-bouncy `decelerate` curve (`cubic-bezier(0.05, 0.7, 0.1, 1)`). This fixes scaled chart marks briefly rendering past their container bounds.
- Add `semantic.motion.easing.playful` (the former overshoot curve) so the bouncy easing stays available for genuine micro-interactions.
- Slow down motion slightly across the board: `base` 180ms→220ms, `fast` 120ms→140ms, `slow` 320ms→360ms.
- Add a dedicated `base.motion.duration.draw` (600ms) for chart draw-on animations; `semantic.motion.duration.draw` now points at it.
