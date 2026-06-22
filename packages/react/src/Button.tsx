"use client";

import { forwardRef } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Button.module.css";

const button = recipe({
  base: styles.button,
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
});

type ButtonVariants = VariantProps<{
  variant: { primary: string; secondary: string; ghost: string };
  size: { sm: string; md: string; lg: string };
}>;

/**
 * A pressable button built on React Aria Components.
 *
 * Interaction state is exposed through `data-*` attributes (`data-hovered`,
 * `data-pressed`, `data-focus-visible`) and styled against Cedar's design
 * tokens, so it re-themes via `[data-theme]` with no code change.
 *
 * Follows React Aria's prop conventions: use `isDisabled` (not `disabled`) and
 * `onPress` (not `onClick`) — `onPress` unifies pointer, keyboard and touch.
 *
 * @example
 * <Button variant="primary" size="md" onPress={save}>Save</Button>
 */
export interface ButtonProps extends AriaButtonProps {
  /** Visual emphasis. @default "primary" */
  variant?: ButtonVariants["variant"];
  /** Control size. @default "md" */
  size?: ButtonVariants["size"];
  /** Extra class names, merged after the variant classes. */
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className, ...props },
    ref,
  ) {
    const { className: variantClass, dataAttrs } = button({ variant, size });
    return (
      <AriaButton
        ref={ref}
        className={className ? `${variantClass} ${className}` : variantClass}
        {...dataAttrs}
        {...props}
      />
    );
  },
);
