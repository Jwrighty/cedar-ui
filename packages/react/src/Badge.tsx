"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Badge.module.css";

const badge = recipe({
  base: styles.badge,
  variants: {
    status: {
      neutral: styles.neutral,
      running: styles.running,
      success: styles.success,
      error: styles.error,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
    },
  },
});

type BadgeVariants = VariantProps<{
  status: {
    neutral: string;
    running: string;
    success: string;
    error: string;
  };
  size: { sm: string; md: string };
}>;

/** Props for status and categorical badges. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic status colour treatment. @default "neutral" */
  status?: BadgeVariants["status"];
  /** Compact or standard badge sizing. @default "md" */
  size?: BadgeVariants["size"];
}

/**
 * A compact label with token-backed status variants.
 *
 * Status is mirrored to `data-status`, so product code and tests can target
 * semantic state without coupling to generated class names.
 *
 * @example
 * <Badge status="running">Running</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { status = "neutral", size = "md", className, ...props },
  ref,
) {
  const { className: variantClass, dataAttrs } = badge({ status, size });

  return (
    <span
      ref={ref}
      className={className ? `${variantClass} ${className}` : variantClass}
      {...dataAttrs}
      {...props}
    />
  );
});

/** Alias for status-heavy product UI. */
export const StatusPill = Badge;
export type StatusPillProps = BadgeProps;
