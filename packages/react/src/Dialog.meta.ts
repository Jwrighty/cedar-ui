import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Dialog (ADR-0009). Source of truth for both human docs and
 * the machine-readable agent surface.
 */
export const dialogMeta: ComponentMeta = {
  summary:
    "A modal dialog that interrupts the user to confirm, warn, or collect focused input.",
  useWhen: [
    "Confirming a destructive or irreversible action before it runs.",
    "Collecting a small, focused set of input without leaving the page.",
    "Showing content that must be acknowledged or dismissed before continuing.",
  ],
  avoidWhen: [
    {
      situation: "Showing a brief, non-blocking notification",
      useInstead: "Toast",
    },
    {
      situation: "Anchored, dismissible content next to a trigger",
      useInstead: "Popover",
    },
    {
      situation: "Non-essential supplementary info on hover/focus",
      useInstead: "Tooltip",
    },
  ],
  a11yNotes: [
    "Focus is trapped while open and returns to the trigger on close (React Aria).",
    "Escape and outside-click dismiss by default; set isDismissable={false} to block.",
    "Always include a Dialog.Title — React Aria uses it for aria-labelledby.",
    "Scroll on the page behind the dialog is locked while it is open.",
  ],
  relatedComponents: ["Popover", "Tooltip", "Button"],
  status: "experimental",
};
