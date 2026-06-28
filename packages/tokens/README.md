# @jwrighty/cedar-tokens

The design tokens that power [Cedar](https://github.com/Jwrighty/cedar-ui).

Tokens are authored once in a neutral [DTCG](https://design-tokens.github.io/community-group/format/)
source and compiled by [Style Dictionary](https://amzn.github.io/style-dictionary/)
into two outputs from one source of truth:

- **`tokens.css`** — CSS custom properties, tiered `base → semantic → component`.
- **typed TS exports** — the same values as importable constants.

Theming is a runtime `[data-theme]` attribute swap over the CSS custom
properties (light / dark / brand), so no rebuild is needed to re-skin.

## Motion and reduced motion

Motion tokens live in the same base -> semantic pipeline as colour and spacing.
Consumers should read the semantic duration/easing tokens for animated moments,
then override semantic durations inside `prefers-reduced-motion` instead of
hard-coding alternate values:

```css
.panel {
  transition:
    opacity var(--semantic-motion-duration-settle)
      var(--semantic-motion-easing-settle),
    background-color var(--semantic-motion-duration-feedback)
      var(--semantic-motion-easing-enter);
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    transition-duration: var(--semantic-motion-duration-instant);
  }
}
```

For JS animation libraries such as Framer Motion, use the typed token exports
for normal motion and branch to cross-fades or instant transitions when
`prefers-reduced-motion` matches.

## Install

```sh
npm install @jwrighty/cedar-tokens
```

## Usage

```ts
// CSS custom properties (apply once, near your app root)
import "@jwrighty/cedar-tokens/tokens.css";

// or the typed values, e.g. for canvas / JS-driven styling
import { tokens } from "@jwrighty/cedar-tokens";
```

Most apps consume tokens transitively through
[`@jwrighty/cedar-react`](https://www.npmjs.com/package/@jwrighty/cedar-react); install this
package directly when you need the raw values.

## License

[MIT](https://github.com/Jwrighty/cedar-ui/blob/main/LICENSE) © Jason Wright
