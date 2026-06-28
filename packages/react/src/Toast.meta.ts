import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Toast (ADR-0009). Source of truth for both human docs and
 * the machine-readable agent surface.
 */
export const toastMeta: ComponentMeta = {
  summary:
    "Transient success or error feedback that stacks, auto-dismisses, and can be manually dismissed.",
  useWhen: [
    "Confirming a background mutation succeeded without moving focus away from the current workflow.",
    "Reporting a recoverable error after an inline action, such as saving tags.",
    "Showing short-lived feedback that should be announced politely and then leave the interface.",
  ],
  avoidWhen: [
    {
      situation:
        "The message requires a decision, destructive confirmation, or blocking acknowledgement",
      useInstead: "Dialog",
    },
    {
      situation: "The feedback belongs to a specific form field or control",
      useInstead: "Inline validation or visible helper text",
    },
    {
      situation: "The information must remain available for later review",
      useInstead: "Persistent page content or an activity log",
    },
  ],
  a11yNotes: [
    "Toast items use polite live-region semantics (`role=status`) so announcements do not interrupt the user's current task.",
    "Every toast includes a keyboard-accessible manual dismiss button.",
    "Do not move focus into the toast for routine success or recoverable error feedback.",
    "Keep copy concise; use persistent content when users need to inspect details after dismissal.",
  ],
  relatedComponents: ["Button", "Dialog", "Popover"],
  status: "experimental",
};
