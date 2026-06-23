"use client";

import { forwardRef, type ElementType, type ReactElement } from "react";
import { recipe, type VariantProps } from "./recipe";
import type { PolymorphicProps, PolymorphicRef } from "./polymorphic";
import styles from "./Box.module.css";

const box = recipe({
  base: styles.box,
  variants: {
    padding: {
      none: styles.paddingNone,
      sm: styles.paddingSm,
      md: styles.paddingMd,
      lg: styles.paddingLg,
    },
  },
});

type BoxVariants = VariantProps<{
  padding: { none: string; sm: string; md: string; lg: string };
}>;

type BoxOwnProps<E extends ElementType> = {
  /** Element or custom component rendered by Box. @default "div" */
  as?: E;
  /** Semantic inset applied on every side. @default "none" */
  padding?: BoxVariants["padding"];
  /** Extra class names, merged after the layout classes. */
  className?: string;
};

/** Props for {@link Box}, including props from the element selected by `as`. */
export type BoxProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  BoxOwnProps<E>
>;

function BoxImpl<E extends ElementType = "div">(
  { as, padding = "none", className, ...props }: BoxProps<E>,
  ref: PolymorphicRef<E>,
) {
  const Component = as ?? "div";
  const { className: variantClass, dataAttrs } = box({ padding });

  return (
    <Component
      ref={ref}
      className={className ? `${variantClass} ${className}` : variantClass}
      {...dataAttrs}
      {...props}
    />
  );
}

/**
 * A polymorphic layout primitive that applies token-backed inset spacing.
 *
 * Native props and refs follow the element selected by `as`. Box has no
 * interactive behaviour; it only establishes Cedar's layout seam.
 *
 * @example
 * <Box as="section" padding="lg" aria-label="Profile">…</Box>
 */
export const Box = forwardRef(BoxImpl as never) as unknown as <
  E extends ElementType = "div",
>(
  props: BoxProps<E> & { ref?: PolymorphicRef<E> },
) => ReactElement | null;
