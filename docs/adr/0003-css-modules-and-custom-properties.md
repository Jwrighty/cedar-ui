# Styling via CSS Modules + CSS custom properties

Component CSS is authored as plain, scoped **CSS Modules** that consume design tokens as **CSS custom properties** (`background: var(--button-bg-rest)`). Theming was already decided (ADR-0001) to be a runtime custom-property swap under a `[data-theme]` attribute, so the styling layer's only remaining job is scoping class names and reading variables. With theming solved orthogonally, a heavier styling toolchain would be solving a problem we no longer have.

## Considered Options

- **vanilla-extract / Panda CSS** — rejected: their type-safe-styling signal isn't worth the bundler-integration and learning-curve delivery risk, given that this project's sophistication signal lives in the token pipeline, not the CSS authoring tool. Cheap type-safety can be bolted onto CSS Modules later if wanted.
- **Tailwind** — rejected: its own theme config competes with and muddies the "I own the token pipeline" story, and the Tailwind-plus-headless pairing re-invites the "shadcn reskin" perception.
- **Runtime CSS-in-JS (Emotion, styled-components)** — rejected: runtime cost and React Server Component friction.

Precedent: GitHub **Primer** and **Radix Themes** both ship plain CSS + custom properties for the same reasons.
