import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for RadioGroup and Radio (ADR-0009). Source of truth for both
 * human docs and the machine-readable agent surface.
 */
export const radioGroupMeta: ComponentMeta = {
  summary:
    "A labelled group for selecting exactly one value from a visible set of options.",
  useWhen: [
    "The user must choose exactly one option from a short, visible list.",
    "Seeing every option at once helps the user compare them.",
    "Selection needs controlled or uncontrolled state with arrow-key navigation.",
  ],
  avoidWhen: [
    {
      situation: "The option list is long or space is constrained",
      useInstead: "Select",
    },
    {
      situation: "The user may choose multiple independent options",
      useInstead: "Checkbox",
    },
    {
      situation: "Representing one immediate on/off setting",
      useInstead: "Switch",
    },
  ],
  a11yNotes: [
    "Always provide a visible group label; React Aria associates it with the radiogroup.",
    "Arrow keys move roving focus and selection between enabled options.",
    "Description and error text are associated with the group automatically.",
    "Use isDisabled on the group or an individual Radio, and isInvalid on the group.",
  ],
  relatedComponents: ["Checkbox", "Select", "Switch"],
  status: "experimental",
};
