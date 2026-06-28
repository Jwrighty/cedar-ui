import type { ComponentMeta } from "./meta";

/**
 * Usage metadata for Skeleton (ADR-0009). Source of truth for both human docs
 * and the machine-readable agent surface.
 */
export const skeletonMeta: ComponentMeta = {
  summary: "A motion-token loading placeholder sized by the caller.",
  useWhen: [
    "Reserving the exact dimensions of content that is loading.",
    "Showing independent Suspense or async widget loading states.",
    "Pairing with a later cross-fade where layout shift would be distracting.",
  ],
  avoidWhen: [
    {
      situation: "Communicating progress or completion percentage",
      useInstead: "A labelled progress indicator",
    },
    {
      situation: "Representing absent or empty data",
      useInstead: "A designed empty state",
    },
  ],
  a11yNotes: [
    "Skeleton is aria-hidden by default so assistive technology does not announce decorative placeholders.",
    "Use nearby text or live regions when the loading state itself needs to be announced.",
    "Shimmer animation is removed under prefers-reduced-motion.",
  ],
  relatedComponents: ["Card", "Stat"],
  status: "experimental",
};
