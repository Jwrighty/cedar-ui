"use client";

import { forwardRef, type ReactNode } from "react";
import {
  FieldError,
  Label,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  Text,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from "react-aria-components";
import { recipe, type VariantProps } from "./recipe";
import styles from "./RadioGroup.module.css";

const radioGroup = recipe({
  base: styles.group,
  variants: {
    orientation: {
      vertical: styles.vertical,
      horizontal: styles.horizontal,
    },
  },
});

type RadioGroupVariants = VariantProps<{
  orientation: { vertical: string; horizontal: string };
}>;

type ValidationResult = Parameters<
  Extract<
    NonNullable<React.ComponentProps<typeof FieldError>["children"]>,
    (...args: never[]) => unknown
  >
>[0];

/**
 * Props for a labelled group of mutually exclusive `Radio` options.
 *
 * Selection is owned by the group. Use `value` with `onChange` for controlled
 * state, or `defaultValue` for uncontrolled state.
 */
export interface RadioGroupProps extends Omit<
  AriaRadioGroupProps,
  "children" | "className" | "orientation"
> {
  /** Visible group label, associated with the radiogroup for assistive tech. */
  label: ReactNode;
  /** The `Radio` options in this group. */
  children: ReactNode;
  /** Optional helper text associated with the radiogroup. */
  description?: ReactNode;
  /** Validation message shown when the group is invalid. */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Layout direction for the options. @default "vertical" */
  orientation?: RadioGroupVariants["orientation"];
  /** Extra class names, merged after the group variant classes. */
  className?: string;
}

/**
 * A labelled, accessible set of mutually exclusive options built on React
 * Aria Components. Label, description, and error associations are wired
 * automatically, and arrow-key roving focus follows the chosen orientation.
 *
 * @example
 * <RadioGroup label="Plan" defaultValue="free">
 *   <Radio value="free">Free</Radio>
 *   <Radio value="pro">Pro</Radio>
 * </RadioGroup>
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      label,
      children,
      description,
      errorMessage,
      orientation = "vertical",
      className,
      ...props
    },
    ref,
  ) {
    const { className: variantClass, dataAttrs } = radioGroup({ orientation });

    return (
      <AriaRadioGroup
        ref={ref}
        orientation={orientation}
        className={className ? `${variantClass} ${className}` : variantClass}
        {...dataAttrs}
        {...props}
      >
        <Label className={styles.label}>{label}</Label>
        {description ? (
          <Text slot="description" className={styles.description}>
            {description}
          </Text>
        ) : null}
        <div className={styles.options}>{children}</div>
        <FieldError className={styles.error}>{errorMessage}</FieldError>
      </AriaRadioGroup>
    );
  },
);

/** Props for one value within a `RadioGroup`. */
export interface RadioProps extends Omit<
  AriaRadioProps,
  "children" | "className"
> {
  /** Unique value submitted to the owning `RadioGroup` when selected. */
  value: string;
  /** Visible option label. */
  children: ReactNode;
  /** Extra class names, merged after the radio class. */
  className?: string;
}

/**
 * One labelled option within a `RadioGroup`.
 *
 * The owning group controls selection; disable an individual option with
 * React Aria's `isDisabled` prop.
 */
export const Radio = forwardRef<HTMLLabelElement, RadioProps>(function Radio(
  { children, className, ...props },
  ref,
) {
  return (
    <AriaRadio
      ref={ref}
      className={className ? `${styles.radio} ${className}` : styles.radio}
      {...props}
    >
      <span className={styles.control} aria-hidden="true">
        <span className={styles.indicator} />
      </span>
      <span>{children}</span>
    </AriaRadio>
  );
});
