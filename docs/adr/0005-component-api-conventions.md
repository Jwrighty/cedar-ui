# Component API conventions; public API preserves React Aria naming

The component "house style" every component obeys:

- **Compound components** for multi-part widgets (`Dialog.Root / Trigger / Content / Title / Close`); single-part components stay flat.
- **`forwardRef`** on every leaf component so refs reach the underlying DOM node.
- **Controlled and uncontrolled** both supported wherever applicable (`value`/`defaultValue`, `open`/`defaultOpen`), leveraging what React Aria provides.
- **`className` + `style` passthrough** so consumers can extend at the edges.
- **Variant props → data-attributes + CSS Module classes**, mapped by a small (~20-line), dependency-free typed recipe helper — no `cva`/Tailwind dependency, keeping the mechanism ours.

The public API **preserves React Aria's conventions** — `isDisabled`, `isSelected`, `onPress` — rather than re-normalizing to DOM names (`disabled`, `onClick`).

## Why preserve, not re-normalize

Re-normalizing to `onClick`/`disabled` is **lossy**: `onPress` exists precisely to unify pointer, keyboard, and touch interaction, and `onClick` re-introduces the gaps. It also adds a wrapping layer (and delivery risk) to every component for the sake of familiarity. Preserving is the lower-risk path and is defensible as a deliberate, documented house rule — the API still reads as "ours" through the variant system, token integration, compound structure, and docs, without relabelling props.

A future reader expecting `onClick`/`disabled` should know this is intentional, not an oversight.
