import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Badge / StatusPill (ADR-0009). Source of truth for both
 * human docs and the machine-readable agent surface.
 */
export const badgeMeta: ComponentMeta = {
  summary: "A compact token-backed label for neutral or status information.",
  useWhen: [
    "Labelling an item's status as running, success, error, or neutral.",
    "Showing short categorical metadata inside dense product UI.",
    "Keeping status colour semantics consistent across Themes.",
  ],
  avoidWhen: [
    {
      situation: "Triggering a user action",
      useInstead: "Button",
    },
    {
      situation: "Displaying long prose or helper text",
      useInstead: "Text",
    },
  ],
  a11yNotes: [
    "Badge is rendered as text, so do not rely on colour alone; include readable label text.",
    "Use aria-label only when the visible label is abbreviated.",
  ],
  relatedComponents: ["Text", "Button"],
  status: "experimental",
};
