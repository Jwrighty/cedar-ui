# Cedar

A React + TypeScript design system, built on a framework-neutral token pipeline, intended as a portfolio centrepiece demonstrating end-to-end design-system ownership. Published under the personal `@cedar-ui` scope as `@cedar-ui/tokens` and `@cedar-ui/react`.

**Cedar**:
The design system itself. Use "Cedar" for the system as a whole; name the packages explicitly (`@cedar-ui/tokens`, `@cedar-ui/react`) when referring to a specific publishable unit.

## Language

### Components

**Primitive**:
A single, focused component that wraps at most one React Aria behaviour and owns its own component-tier tokens. May be compound/multi-part (Dialog is a primitive — it wraps one overlay/focus behaviour) but does not combine other primitives.
_Avoid_: atom, base component

**Composed component**:
A component built by combining primitives (and layout) into a recurring higher-level pattern. Adds no new low-level behaviour — only composition and opinion. (FormField = Label + TextField + error/hint message.)
_Avoid_: molecule, pattern, complex component

**Layout primitive**:
A styling-only primitive with no interactive behaviour (Stack, Inline, Box), used to compose everything else.

### Tokens

**Base token**:
A raw, context-free value — a palette or scale entry such as `blue-500` or `space-4`. The lowest tier; everything else references these.
_Avoid_: primitive token (collides with Primitive component), global, core, reference

**Semantic token**:
A purpose-named token that references a base token (`color-action`, `space-inset-md`). Expresses intent, not raw value; this is the tier themes re-point.

**Component token**:
A token owned by one component (`button-bg-rest`), referencing a semantic token. Added only where a component genuinely needs to deviate from semantics — not reflexively.

### Theming

**Theme**:
A named runtime set of CSS custom-property values, swapped via a `[data-theme]` attribute with no rebuild. Initial themes: light, dark, and one alternate brand; density is a planned axis.
