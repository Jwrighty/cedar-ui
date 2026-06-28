"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Skeleton.module.css";

const skeleton = recipe({
  base: styles.skeleton,
  variants: {
    shape: {
      rectangle: styles.rectangle,
      rounded: styles.rounded,
      circle: styles.circle,
      text: styles.text,
    },
  },
});

type SkeletonVariants = VariantProps<{
  shape: {
    rectangle: string;
    rounded: string;
    circle: string;
    text: string;
  };
}>;

/** Props for the Skeleton loading placeholder. */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Placeholder silhouette. The caller controls concrete dimensions. @default "rounded" */
  shape?: SkeletonVariants["shape"];
}

/**
 * A token-driven loading placeholder that reserves the final content geometry.
 *
 * Set width, height, or aspect ratio from the caller so the loading state and
 * loaded content occupy the same space. The shimmer uses Cedar motion tokens
 * and becomes static when the user prefers reduced motion.
 *
 * @example
 * <Skeleton shape="rounded" style={{ height: 96 }} />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ shape = "rounded", className, ...props }, ref) {
    const { className: variantClass, dataAttrs } = skeleton({ shape });

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={className ? `${variantClass} ${className}` : variantClass}
        {...dataAttrs}
        {...props}
      />
    );
  },
);
