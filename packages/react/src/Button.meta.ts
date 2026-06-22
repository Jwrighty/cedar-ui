import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Button (ADR-0009). Source of truth for both human docs and
 * the machine-readable agent surface.
 */
export const buttonMeta: ComponentMeta = {
  summary: "A pressable button that triggers an action in the current view.",
  useWhen: [
    "Submitting a form or confirming a decision.",
    "Triggering an in-page action (open a dialog, save, delete).",
    "Any of the three emphasis levels fit: primary, secondary, or ghost.",
  ],
  avoidWhen: [
    { situation: "Navigating to a URL or route", useInstead: "Link" },
    {
      situation: "Toggling a binary on/off state",
      useInstead: "Switch or ToggleButton",
    },
    {
      situation: "Choosing one of several options",
      useInstead: "RadioGroup or Select",
    },
  ],
  a11yNotes: [
    "Renders a native <button>; keyboard- and screen-reader-operable by default.",
    "Use onPress (not onClick) so pointer, keyboard, and touch are unified.",
    "Disable with isDisabled; focus is managed by React Aria.",
    "Focus-visible ring is driven by [data-focus-visible], shown only for keyboard focus.",
  ],
  relatedComponents: ["Link", "ToggleButton"],
  status: "experimental",
};
