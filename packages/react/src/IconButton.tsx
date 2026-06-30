"use client";

import { forwardRef, type ReactNode } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { recipe, type VariantProps } from "./recipe";
import styles from "./IconButton.module.css";

const iconButton = recipe({
  base: styles.iconButton,
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

type IconButtonVariants = VariantProps<{
  variant: { primary: string; secondary: string; ghost: string };
  size: { sm: string; md: string; lg: string };
}>;

/**
 * A square, icon-only button built on React Aria Components.
 *
 * Use it for compact, recognisable actions that don't need a text label —
 * toolbar controls, a sidebar collapse toggle, a theme switch, a dialog close.
 * It owns its square geometry and icon sizing so a single icon child renders
 * consistently; pass a 24×24 icon (e.g. a Lucide glyph) and the button scales
 * it to match the control size.
 *
 * Unlike `Button`, the `ghost` and `secondary` variants are **neutral** by
 * default (they inherit text colour, not the accent), because icon-only
 * controls are usually chrome rather than the primary call to action.
 *
 * An icon alone conveys no accessible name, so `aria-label` is **required** —
 * the type system enforces it.
 *
 * Follows React Aria's prop conventions: use `isDisabled` (not `disabled`) and
 * `onPress` (not `onClick`).
 *
 * @example
 * <IconButton aria-label="Close" variant="ghost" size="sm" onPress={close}>
 *   <X />
 * </IconButton>
 */
export interface IconButtonProps extends AriaButtonProps {
  /** Visual emphasis. @default "ghost" */
  variant?: IconButtonVariants["variant"];
  /** Control size; also drives the icon size (sm 16, md 20, lg 24). @default "md" */
  size?: IconButtonVariants["size"];
  /** Extra class names, merged after the variant classes. */
  className?: string;
  /** Accessible name for the action. Required — an icon has no text. */
  "aria-label": string;
  /** A single icon element. */
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = "ghost", size = "md", className, ...props },
    ref,
  ) {
    const { className: variantClass, dataAttrs } = iconButton({
      variant,
      size,
    });
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
