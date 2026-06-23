import type { ComponentMeta } from "./meta";

/** Usage metadata for the Box layout primitive (ADR-0009). */
export const boxMeta: ComponentMeta = {
  summary: "A polymorphic layout primitive for token-backed inset spacing.",
  useWhen: [
    "A region needs semantic padding without imposing flow on its children.",
    "The rendered HTML element must be selected to match the content semantics.",
    "Building a surface that will contain Stack or Inline layouts.",
  ],
  avoidWhen: [
    {
      situation: "Children need a consistent vertical rhythm",
      useInstead: "Stack",
    },
    {
      situation: "Children need a wrapping horizontal flow",
      useInstead: "Inline",
    },
  ],
  a11yNotes: [
    "Box adds no role or interactive behaviour; choose an `as` element that matches the content semantics.",
    "Native ARIA attributes and refs pass through to the selected element.",
  ],
  relatedComponents: ["Stack", "Inline"],
  status: "experimental",
};
