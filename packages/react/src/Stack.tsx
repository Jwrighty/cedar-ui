"use client";

import { forwardRef, type ElementType, type ReactElement } from "react";
import type { PolymorphicProps, PolymorphicRef } from "./polymorphic";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Stack.module.css";

const stack = recipe({
  base: styles.stack,
  variants: {
    gap: {
      none: styles.gapNone,
      sm: styles.gapSm,
      md: styles.gapMd,
      lg: styles.gapLg,
    },
  },
});

type StackVariants = VariantProps<{
  gap: { none: string; sm: string; md: string; lg: string };
}>;

type StackOwnProps<E extends ElementType> = {
  /** Element or custom component rendered by Stack. @default "div" */
  as?: E;
  /** Semantic spacing between children. @default "md" */
  gap?: StackVariants["gap"];
  /** Extra class names, merged after the layout classes. */
  className?: string;
};

/** Props for {@link Stack}, including props from the element selected by `as`. */
export type StackProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  StackOwnProps<E>
>;

function StackImpl<E extends ElementType = "div">(
  { as, gap = "md", className, ...props }: StackProps<E>,
  ref: PolymorphicRef<E>,
) {
  const Component = as ?? "div";
  const { className: variantClass, dataAttrs } = stack({ gap });

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
 * A polymorphic layout primitive that arranges children in a vertical flow.
 *
 * Gap values resolve through Cedar's semantic stack-spacing tokens. Native
 * props and refs follow the element selected by `as`.
 *
 * @example
 * <Stack as="ul" gap="lg"><li>First</li><li>Second</li></Stack>
 */
export const Stack = forwardRef(StackImpl as never) as unknown as <
  E extends ElementType = "div",
>(
  props: StackProps<E> & { ref?: PolymorphicRef<E> },
) => ReactElement | null;
