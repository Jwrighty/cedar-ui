"use client";

import { forwardRef, type ElementType, type ReactElement } from "react";
import type { PolymorphicProps, PolymorphicRef } from "./polymorphic";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Inline.module.css";

const inline = recipe({
  base: styles.inline,
  variants: {
    gap: {
      none: styles.gapNone,
      sm: styles.gapSm,
      md: styles.gapMd,
      lg: styles.gapLg,
    },
  },
});

type InlineVariants = VariantProps<{
  gap: { none: string; sm: string; md: string; lg: string };
}>;

type InlineOwnProps<E extends ElementType> = {
  /** Element or custom component rendered by Inline. @default "div" */
  as?: E;
  /** Semantic spacing between children. @default "md" */
  gap?: InlineVariants["gap"];
  /** Extra class names, merged after the layout classes. */
  className?: string;
};

/** Props for {@link Inline}, including props from the element selected by `as`. */
export type InlineProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  InlineOwnProps<E>
>;

function InlineImpl<E extends ElementType = "div">(
  { as, gap = "md", className, ...props }: InlineProps<E>,
  ref: PolymorphicRef<E>,
) {
  const Component = as ?? "div";
  const { className: variantClass, dataAttrs } = inline({ gap });

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
 * A polymorphic layout primitive that arranges children in a wrapping row.
 *
 * Gap values resolve through Cedar's semantic gap tokens. Native props and
 * refs follow the element selected by `as`.
 *
 * @example
 * <Inline as="nav" gap="sm"><a href="/back">Back</a><a href="/next">Next</a></Inline>
 */
export const Inline = forwardRef(InlineImpl as never) as unknown as <
  E extends ElementType = "div",
>(
  props: InlineProps<E> & { ref?: PolymorphicRef<E> },
) => ReactElement | null;
