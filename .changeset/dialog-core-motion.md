---
"@jwrighty/cedar-react": minor
---

Dialog: add tokenized entrance/exit motion — the scrim cross-fades and the panel rises and settles in via React Aria's `data-entering`/`data-exiting` hooks, with a calm cross-fade-only variant under `prefers-reduced-motion`. Also forward `aria-labelledby`/`aria-label` to the underlying dialog so it can be labelled by an existing heading in your content rather than only a `Dialog.Title` slot.
