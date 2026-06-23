import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Tooltip (ADR-0009). Source of truth for both human docs
 * and the machine-readable agent surface.
 */
export const tooltipMeta: ComponentMeta = {
  summary:
    "A short, supplementary description that appears beside a focusable trigger on hover or keyboard focus.",
  useWhen: [
    "Explaining an unfamiliar icon button without replacing its accessible name.",
    "Adding a brief hint that is useful but not required to complete the task.",
    "Describing a focusable interactive trigger in one short phrase.",
  ],
  avoidWhen: [
    {
      situation:
        "Showing interactive controls, links, or rich structured content",
      useInstead: "Popover",
    },
    {
      situation: "Providing instructions that are required to complete a task",
      useInstead: "Persistent visible help text",
    },
    {
      situation: "Attaching supplementary text to a non-focusable element",
      useInstead: "Visible text or make the trigger genuinely interactive",
    },
  ],
  a11yNotes: [
    "React Aria opens the tooltip on both pointer hover and keyboard focus, with shared warmup/cooldown delays.",
    "The trigger receives aria-describedby while the tooltip is open, so its text is discoverable to assistive technology.",
    "Escape, blur, pointer exit, and trigger press dismiss the tooltip as appropriate.",
    "Tooltip content must remain non-interactive; use Popover when users need to act inside the overlay.",
  ],
  relatedComponents: ["Popover", "Button", "Dialog"],
  status: "experimental",
};
