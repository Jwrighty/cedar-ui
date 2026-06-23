import type { ComponentMeta } from "./meta";

/** Usage metadata for the Inline layout primitive (ADR-0009). */
export const inlineMeta: ComponentMeta = {
  summary: "A polymorphic layout primitive for token-spaced wrapping rows.",
  useWhen: [
    "Sibling elements should read in a horizontal flow.",
    "Actions, tags, or navigation items need consistent token-backed gaps.",
    "Items should wrap naturally when horizontal space runs out.",
  ],
  avoidWhen: [
    {
      situation: "Children need a vertical rhythm",
      useInstead: "Stack",
    },
    {
      situation: "Only inset padding is needed",
      useInstead: "Box",
    },
  ],
  a11yNotes: [
    "Inline adds no role or interaction; choose `as` and ARIA attributes for the content's semantics.",
    "Wrapping does not alter DOM or keyboard focus order.",
  ],
  relatedComponents: ["Box", "Stack"],
  status: "experimental",
};
