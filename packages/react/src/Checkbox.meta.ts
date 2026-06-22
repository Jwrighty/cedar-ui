import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Checkbox (ADR-0009). Source of truth for both human docs
 * and Cedar's machine-readable agent surface.
 */
export const checkboxMeta: ComponentMeta = {
  summary:
    "A labelled binary form control for selecting one or more independent options.",
  useWhen: [
    "A form asks the user to opt in to or acknowledge a choice.",
    "Multiple options may be selected independently.",
    "A parent option needs an indeterminate state to summarize child selections.",
  ],
  avoidWhen: [
    {
      situation: "A setting takes effect immediately when toggled",
      useInstead: "Switch",
    },
    {
      situation: "Exactly one option must be chosen from a set",
      useInstead: "RadioGroup",
    },
  ],
  a11yNotes: [
    "The visible label is associated with a native checkbox input by React Aria.",
    "Pointer and Space-key interaction are supported; selection may be controlled or uncontrolled.",
    "Indeterminate is a visual mixed state and does not replace the selected value submitted by a form.",
    "Use isInvalid and isDisabled so React Aria exposes the corresponding accessible state.",
  ],
  relatedComponents: ["Switch", "RadioGroup"],
  status: "experimental",
};
