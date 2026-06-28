import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Stat / MetricCard (ADR-0009). Source of truth for both
 * human docs and the machine-readable agent surface.
 */
export const statMeta: ComponentMeta = {
  summary: "A composed Card for one headline metric, delta, and visual slot.",
  useWhen: [
    "Showing a dashboard KPI with label, value, and trend delta.",
    "Pairing a headline number with a sparkline or loading placeholder.",
    "Keeping metric-card composition consistent while reusing Card behaviour.",
  ],
  avoidWhen: [
    {
      situation: "Displaying arbitrary content without metric hierarchy",
      useInstead: "Card",
    },
    {
      situation: "Rendering a table of many metrics",
      useInstead: "Table primitives with Text",
    },
  ],
  a11yNotes: [
    "Stat does not add a landmark role; give the card a label when it should be navigable as a region.",
    "Delta direction is expressed with text plus semantic colour, not colour alone.",
  ],
  relatedComponents: ["Card", "Skeleton", "Text"],
  status: "experimental",
};
