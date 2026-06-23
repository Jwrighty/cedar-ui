import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Heading (ADR-0009). Source of truth for both human docs and
 * the machine-readable agent surface.
 */
export const headingMeta: ComponentMeta = {
  summary:
    "A themeable semantic heading primitive with document level decoupled from visual scale.",
  useWhen: [
    "Rendering page, section, card, or panel headings.",
    "Preserving a logical document outline while choosing any visual type-scale step.",
    "A heading's size, weight, and foreground tone should follow Cedar theme tokens.",
  ],
  avoidWhen: [
    {
      situation: "Rendering body copy, captions, or inline prose",
      useInstead: "Text",
    },
    {
      situation: "Rendering a dialog title inside Cedar Dialog",
      useInstead: "Dialog.Title",
    },
    {
      situation: "Making a heading itself perform an action",
      useInstead: "Button or a composed disclosure primitive",
    },
  ],
  a11yNotes: [
    "`level` renders a real h1–h6 element; keep levels in logical document order.",
    "Visual `size` does not change the semantic level exposed to assistive technology.",
    "Do not skip heading levels just to get a smaller or larger visual style.",
  ],
  relatedComponents: ["Text", "Dialog", "Button"],
  status: "experimental",
};
