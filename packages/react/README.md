# @jwrighty/cedar-react

Accessible, themeable React components from [Cedar](https://github.com/Jwrighty/cedar-ui).

Components are built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
for behaviour and accessibility, styled with CSS Modules against
[`@jwrighty/cedar-tokens`](https://www.npmjs.com/package/@jwrighty/cedar-tokens). They re-skin
across light / dark / brand themes via a single `[data-theme]` attribute, with
no component code changes.

The skeleton ships **Button**, **TextField**, and **Dialog**.

## Install

```sh
npm install @jwrighty/cedar-react @jwrighty/cedar-tokens
```

`react` and `react-dom` (v19) are peer dependencies.

## Usage

Import the two stylesheets once near your app root, then use any component:

```tsx
import "@jwrighty/cedar-tokens/tokens.css";
import "@jwrighty/cedar-react/styles.css";
import { Button, Dialog } from "@jwrighty/cedar-react";

export function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Hello from Cedar</Dialog.Title>
        <Dialog.Close variant="primary">Done</Dialog.Close>
        <Dialog.Close>Cancel</Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

Components are client components (they carry `"use client"`), so they work in
the Next.js App Router without extra configuration.

## Conventions

Cedar preserves React Aria's prop house style — `isDisabled` (not `disabled`),
`onPress` (not `onClick`) — and forwards refs to the underlying DOM node.
`className` / `style` pass through for edge adjustments.

## License

[MIT](https://github.com/Jwrighty/cedar-ui/blob/main/LICENSE) © Jason Wright
