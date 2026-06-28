import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Table primitives (ADR-0009). Source of truth for both
 * human docs and the machine-readable agent surface.
 */
export const tableMeta: ComponentMeta = {
  summary: "Styled native table elements for app-owned data grids.",
  useWhen: [
    "Rendering dense rows from TanStack Table or another app-owned row model.",
    "Applying Cedar table spacing, typography, and tabular numerals.",
    "Keeping table presentation consistent without adopting a grid abstraction.",
  ],
  avoidWhen: [
    {
      situation: "Needing sorting, filtering, selection, or virtualisation",
      useInstead: "TanStack Table in the consuming app",
    },
    {
      situation: "Laying out non-tabular content",
      useInstead: "Stack, Inline, or Box",
    },
  ],
  a11yNotes: [
    "These primitives render native table elements and preserve browser table semantics.",
    "Sorting and interactive row behaviour must be implemented by the app with appropriate labels and keyboard support.",
    "Use isNumeric for numeric columns so tabular numerals line up across rows.",
  ],
  relatedComponents: ["Text", "Badge"],
  status: "experimental",
};
