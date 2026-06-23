import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Tabs (ADR-0009). Source of truth for both human docs and
 * the machine-readable agent surface.
 */
export const tabsMeta: ComponentMeta = {
  summary:
    "A tabbed interface for switching between related panels without leaving the current page.",
  useWhen: [
    "Grouping peer sections that share one page or card context.",
    "Letting users switch between related views such as Overview, Activity, and Settings.",
    "Keeping the selected section addressable by app state with selectedKey when needed.",
  ],
  avoidWhen: [
    {
      situation: "Choosing one value from a form field set",
      useInstead: "RadioGroup or Select",
    },
    {
      situation: "Navigating between app routes or unrelated destinations",
      useInstead: "Link or navigation primitives",
    },
    {
      situation: "Revealing a single optional section inline",
      useInstead: "Disclosure or Accordion",
    },
  ],
  a11yNotes: [
    "Built on React Aria Components Tabs, TabList, Tab, and TabPanel.",
    "React Aria wires role=tablist, role=tab, role=tabpanel, aria-controls, and aria-labelledby.",
    "Provide an aria-label or aria-labelledby on Tabs.List to name the tab strip.",
    "Arrow-key navigation and disabled tabs are handled by React Aria; style focus with [data-focus-visible].",
  ],
  relatedComponents: ["RadioGroup", "Select", "Disclosure"],
  status: "experimental",
};
