# Build output and CSS distribution

`@cedar-ui/react` is built with **Vite library mode** (ESM-first), and `@cedar-ui/tokens` is built with **Style Dictionary** (no bundler needed — it emits CSS custom properties + typed TS). Cedar ships **two importable stylesheets**: `@cedar-ui/tokens/tokens.css` (the CSS custom properties / themes) and `@cedar-ui/react/styles.css` (extracted component styles). Consumers do two CSS imports; there is no runtime style injection.

## Two non-obvious constraints (the reason this is recorded)

1. **CSS Modules must be precompiled.** A consumer's bundler cannot process `.module.css`. The build hashes class names at build time, emits plain CSS into the extracted stylesheet, and emits JS that references the pre-hashed names. A contributor must not assume CSS Modules "just publish."
2. **`"use client"` must be preserved.** React Aria components are client components; the real-time-collab and dashboard consumers are expected to be Next.js App Router (RSC). The Vite build must be configured to preserve `"use client"` directives, or those consumers break on import.

## Considered Options

- **tsup / esbuild** — rejected for `@cedar-ui/react`: handles CSS Modules + stylesheet extraction poorly. (Fine for pure-TS builds, but tokens already use Style Dictionary.)
- **Runtime CSS injection** — rejected: SSR/RSC friction; the two-stylesheet import model is simpler and server-safe.
