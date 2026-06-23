import type { ComponentMeta } from "./meta";

/** Usage metadata for the Stack layout primitive (ADR-0009). */
export const stackMeta: ComponentMeta = {
  summary: "A polymorphic layout primitive for token-spaced vertical flow.",
  useWhen: [
    "Sibling elements need a consistent vertical rhythm.",
    "A list, form section, or content region should flow from top to bottom.",
    "Spacing should follow Cedar semantic stack tokens.",
  ],
  avoidWhen: [
    {
      situation: "Children should flow horizontally and wrap",
      useInstead: "Inline",
    },
    {
      situation: "Only inset padding is needed",
      useInstead: "Box",
    },
  ],
  a11yNotes: [
    "Stack adds no role; use `as` to preserve list, section, or other document semantics.",
    "Visual order follows DOM order and should not replace meaningful semantic structure.",
  ],
  relatedComponents: ["Box", "Inline"],
  status: "experimental",
};
