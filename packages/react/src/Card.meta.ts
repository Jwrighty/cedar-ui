import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Card (ADR-0009). Source of truth for both human docs and
 * the machine-readable agent surface.
 */
export const cardMeta: ComponentMeta = {
  summary: "An outlined surface for grouping related content.",
  useWhen: [
    "Separating a self-contained panel from the page surface.",
    "Composing dashboard widgets with optional header, body, and footer regions.",
    "Framing dense information that should remain visually connected.",
  ],
  avoidWhen: [
    {
      situation: "Only spacing children in a layout",
      useInstead: "Stack, Inline, or Box",
    },
    {
      situation: "Creating a modal or popover surface",
      useInstead: "Dialog or Popover",
    },
  ],
  a11yNotes: [
    "Card has no default landmark role; choose section/article and an accessible name when the group needs navigation semantics.",
    "Header, body, and footer slots are structural only and do not change reading order.",
  ],
  relatedComponents: ["Box", "Stack", "Dialog", "Popover"],
  status: "experimental",
};
