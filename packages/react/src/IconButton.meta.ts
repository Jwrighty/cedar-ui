import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for IconButton (ADR-0009). Source of truth for both human docs
 * and the machine-readable agent surface.
 */
export const iconButtonMeta: ComponentMeta = {
  summary: "A square, icon-only button for compact, recognisable actions.",
  useWhen: [
    "A control is recognisable from its icon alone (close, collapse, theme toggle, overflow menu).",
    "Space is tight — a toolbar, table row, dialog header, or app chrome.",
    "You want a neutral, low-emphasis action that doesn't compete with primary buttons.",
  ],
  avoidWhen: [
    {
      situation: "The action needs a visible text label to be understood",
      useInstead: "Button",
    },
    {
      situation: "Toggling a binary on/off state",
      useInstead: "Switch or ToggleButton",
    },
    { situation: "Navigating to a URL or route", useInstead: "Link" },
  ],
  a11yNotes: [
    "aria-label is required — an icon conveys no accessible name on its own.",
    "Renders a native <button>; keyboard- and screen-reader-operable by default.",
    "Use onPress (not onClick) so pointer, keyboard, and touch are unified.",
    "Mark the icon itself aria-hidden so the label is the only accessible name.",
    "Focus-visible ring is driven by [data-focus-visible], shown only for keyboard focus.",
  ],
  relatedComponents: ["Button", "Tooltip"],
  status: "experimental",
};
