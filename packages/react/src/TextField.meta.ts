import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for TextField (ADR-0009). Source of truth for both human docs
 * and the machine-readable agent surface.
 */
export const textFieldMeta: ComponentMeta = {
  summary:
    "A labelled single-line text input with description and error support.",
  useWhen: [
    "Collecting one line of free-form text (name, email, search term).",
    "A field needs a visible label, helper text, and/or a validation message.",
    "Controlled or uncontrolled input with React Aria's field semantics.",
  ],
  avoidWhen: [
    {
      situation: "Capturing multiple lines of text",
      useInstead: "TextArea",
    },
    {
      situation: "Choosing from a fixed set of options",
      useInstead: "Select or RadioGroup",
    },
    {
      situation: "Toggling a single boolean",
      useInstead: "Checkbox or Switch",
    },
  ],
  a11yNotes: [
    "Label is associated with the input automatically — always pass `label`.",
    "Description and error are linked via aria-describedby by React Aria.",
    "Mark invalid state with isInvalid + errorMessage; the input gets aria-invalid.",
    "Focus ring is driven by [data-focused]; styling reflects keyboard and pointer focus.",
  ],
  relatedComponents: ["TextArea", "SearchField", "Select"],
  status: "experimental",
};
