import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Switch (ADR-0009), shared by human documentation and the
 * machine-readable agent surface.
 */
export const switchMeta: ComponentMeta = {
  summary: "A labelled control that turns an immediate setting on or off.",
  useWhen: [
    "A binary setting takes effect immediately when changed.",
    "Users need to see whether a setting is currently on or off.",
  ],
  avoidWhen: [
    {
      situation: "Selecting an option for later form submission or agreement",
      useInstead: "Checkbox",
    },
    {
      situation: "Choosing exactly one option from a group",
      useInstead: "RadioGroup or Select",
    },
  ],
  a11yNotes: [
    "Renders a labelled switch input with pointer and keyboard support from React Aria.",
    "Provide a concise visible label through children; it becomes the accessible name.",
    "Use isSelected/onChange for controlled state or defaultSelected for uncontrolled state.",
    "Focus-visible styling is shown for keyboard focus through [data-focus-visible].",
  ],
  relatedComponents: ["Checkbox"],
  status: "experimental",
};
