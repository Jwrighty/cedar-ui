import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Text (ADR-0009). Source of truth for both human docs and
 * the machine-readable agent surface.
 */
export const textMeta: ComponentMeta = {
  summary:
    "A themeable typography primitive for body copy and inline non-heading text.",
  useWhen: [
    "Rendering paragraphs, helper copy, captions, or inline text.",
    "You need semantic element choice (`p`, `span`, `strong`, etc.) independent from visual size.",
    "Size, weight, and foreground tone should follow Cedar's semantic type-scale and theme tokens.",
  ],
  avoidWhen: [
    {
      situation: "Rendering a page, section, or card heading",
      useInstead: "Heading",
    },
    {
      situation: "Triggering an action or navigation",
      useInstead: "Button or Link",
    },
    {
      situation: "Labelling or validating an input field",
      useInstead: "TextField or a composed form-field primitive",
    },
  ],
  a11yNotes: [
    "Choose the semantic element with `as`; the default is a paragraph.",
    "Do not use Text to fake headings visually — use Heading so assistive technology gets the document outline.",
    "Tone changes colour only; do not rely on colour alone to communicate required or error state.",
  ],
  relatedComponents: ["Heading", "TextField", "Button"],
  status: "experimental",
};
