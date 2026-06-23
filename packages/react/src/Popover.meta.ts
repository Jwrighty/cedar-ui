import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Popover (ADR-0009). Source of truth for both human docs
 * and the machine-readable agent surface.
 */
export const popoverMeta: ComponentMeta = {
  summary:
    "An anchored overlay for interactive content that dismisses without interrupting the page.",
  useWhen: [
    "Showing interactive controls or supporting actions next to their trigger.",
    "Keeping supplementary content available without navigating away or blocking the page.",
    "Building an anchored overlay that needs collision-aware placement and focus management.",
  ],
  avoidWhen: [
    {
      situation: "Showing brief, non-interactive help on hover or focus",
      useInstead: "Tooltip",
    },
    {
      situation:
        "Requiring the user to acknowledge or complete a blocking task",
      useInstead: "Dialog",
    },
    {
      situation: "Presenting a list of commands or actions",
      useInstead: "Menu",
    },
    {
      situation: "Choosing one value from a predefined list",
      useInstead: "Select",
    },
  ],
  a11yNotes: [
    "React Aria labels the popover from its trigger and moves focus into the overlay when it opens.",
    "Escape and outside interaction dismiss the popover, then focus returns to the trigger.",
    "Keep interactive content keyboard operable and use a concise trigger label that also names the popover.",
    "Positioning and collision avoidance are delegated to React Aria and adapt to the available viewport space.",
  ],
  relatedComponents: ["Tooltip", "Dialog", "Menu", "Select"],
  status: "experimental",
};
