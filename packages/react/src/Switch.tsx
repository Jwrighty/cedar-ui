"use client";

import { forwardRef, type ReactNode } from "react";
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Switch.module.css";

const switchRecipe = recipe({
  base: styles.switch,
  variants: {
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
});

type SwitchVariants = VariantProps<{
  size: { sm: string; md: string; lg: string };
}>;

/**
 * Props for the Cedar {@link Switch} primitive.
 *
 * Controlled and uncontrolled state use React Aria's names: pass `isSelected`
 * with `onChange` for controlled state, or `defaultSelected` for uncontrolled
 * state. Disable interaction with `isDisabled`.
 */
export interface SwitchProps extends AriaSwitchProps {
  /** Visible label that gives the switch its accessible name. */
  children: ReactNode;
  /** Visual control size. @default "md" */
  size?: SwitchVariants["size"];
  /** Extra class names, merged after the size classes. */
  className?: string;
}

/**
 * A labelled on/off setting built on React Aria Components.
 *
 * Use Switch for settings that take effect immediately. Use Checkbox instead
 * when the checked state represents form selection or agreement. Selected,
 * disabled, hover, pressed, and focus-visible state is exposed through React
 * Aria's `data-*` attributes and styled against Cedar design tokens.
 *
 * @example
 * <Switch defaultSelected>Enable notifications</Switch>
 *
 * @example
 * <Switch isSelected={enabled} onChange={setEnabled}>
 *   Enable notifications
 * </Switch>
 */
export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(function Switch(
  { children, size = "md", className, ...props },
  ref,
) {
  const { className: variantClass, dataAttrs } = switchRecipe({ size });

  return (
    <AriaSwitch
      ref={ref}
      className={className ? `${variantClass} ${className}` : variantClass}
      {...dataAttrs}
      {...props}
    >
      <span aria-hidden="true" className={styles.track}>
        <span className={styles.thumb} />
      </span>
      <span className={styles.label}>{children}</span>
    </AriaSwitch>
  );
});
