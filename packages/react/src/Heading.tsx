"use client";

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Heading.module.css";

const heading = recipe({
  base: styles.heading,
  variants: {
    size: {
      xs: styles.xs,
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
      xl: styles.xl,
      "2xl": styles["2xl"],
    },
    weight: {
      regular: styles.regular,
      medium: styles.medium,
      semibold: styles.semibold,
    },
    tone: {
      default: styles.default,
      muted: styles.muted,
      accent: styles.accent,
      danger: styles.danger,
    },
  },
});

type HeadingVariants = VariantProps<{
  size: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  weight: { regular: string; medium: string; semibold: string };
  tone: { default: string; muted: string; accent: string; danger: string };
}>;

/** Document-outline level rendered by Heading. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const headingElementByLevel: Record<HeadingLevel, HeadingElement> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

/**
 * Props for the Heading primitive.
 *
 * `level` controls document outline semantics, while `size`, `weight` and
 * `tone` independently control visual treatment through Cedar tokens.
 */
export interface HeadingProps extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  "className" | "style" | "children"
> {
  /** Semantic heading level to render. @default 2 */
  level?: HeadingLevel;
  /** Visual type-scale step. @default "xl" */
  size?: HeadingVariants["size"];
  /** Visual font weight. @default "semibold" */
  weight?: HeadingVariants["weight"];
  /** Foreground colour role. @default "default" */
  tone?: HeadingVariants["tone"];
  /** Heading content. */
  children: ReactNode;
  /** Extra class names, merged after the variant classes. */
  className?: string;
  /** Inline styles passed through to the rendered heading element. */
  style?: CSSProperties;
}

/**
 * Themeable semantic heading primitive with decoupled visual scale.
 *
 * @example
 * <Heading level={2} size="sm">Billing details</Heading>
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    {
      level = 2,
      size = "xl",
      weight = "semibold",
      tone = "default",
      className,
      ...props
    },
    ref,
  ) {
    const Component = headingElementByLevel[level];
    const { className: variantClass, dataAttrs } = heading({
      size,
      weight,
      tone,
    });

    return (
      <Component
        ref={ref}
        className={className ? `${variantClass} ${className}` : variantClass}
        {...dataAttrs}
        {...props}
      />
    );
  },
);
