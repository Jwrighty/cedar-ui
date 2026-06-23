"use client";

import {
  createElement,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Text.module.css";

const text = recipe({
  base: styles.text,
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

type TextVariants = VariantProps<{
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

/**
 * Semantic HTML elements supported by Text's polymorphic `as` prop.
 */
export type TextElement = "p" | "span" | "div" | "strong" | "em" | "small";

/**
 * Props for the Text primitive.
 *
 * `Text` is a styling-only primitive: the rendered semantic element comes from
 * `as`, while `size`, `weight` and `tone` only change visual treatment through
 * Cedar tokens.
 */
export interface TextProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "className" | "style" | "children"
> {
  /** Semantic element to render. @default "p" */
  as?: TextElement;
  /** Visual type-scale step. @default "md" */
  size?: TextVariants["size"];
  /** Visual font weight. @default "regular" */
  weight?: TextVariants["weight"];
  /** Foreground colour role. @default "default" */
  tone?: TextVariants["tone"];
  /** Text or inline content to render. */
  children: ReactNode;
  /** Extra class names, merged after the variant classes. */
  className?: string;
  /** Inline styles passed through to the rendered element. */
  style?: CSSProperties;
}

/**
 * Themeable body-copy primitive for paragraphs, inline copy, helper text and
 * other non-heading typography.
 *
 * @example
 * <Text as="span" size="sm" tone="muted">Optional</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Component = "p",
    size = "md",
    weight = "regular",
    tone = "default",
    className,
    ...props
  },
  ref,
) {
  const { className: variantClass, dataAttrs } = text({ size, weight, tone });

  return createElement(Component, {
    ref,
    className: className ? `${variantClass} ${className}` : variantClass,
    ...dataAttrs,
    ...props,
  });
});
