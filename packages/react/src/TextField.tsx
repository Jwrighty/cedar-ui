"use client";

import { forwardRef, type ReactNode } from "react";
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Label,
  Input,
  Text,
  FieldError,
} from "react-aria-components";
import styles from "./TextField.module.css";

/**
 * A labelled single-line text input built on React Aria Components.
 *
 * Composes RAC's `Label`, `Input`, `Text` (description) and `FieldError` parts
 * into one field, wiring up the label/input/description/error associations for
 * you. Controlled (`value`) and uncontrolled (`defaultValue`) both work.
 *
 * State is exposed through `data-*` attributes (`data-hovered`, `data-focused`,
 * `data-invalid`, `data-disabled`) and styled against Cedar's design tokens, so
 * it re-themes via `[data-theme]` with no code change.
 *
 * Follows React Aria's prop conventions: `isDisabled`/`isInvalid`/`isRequired`
 * (not the bare DOM attributes). Pass `errorMessage` to show validation state.
 *
 * @example
 * <TextField label="Email" description="We'll never share it." type="email" />
 *
 * @example
 * <TextField label="Name" isInvalid errorMessage="Name is required" />
 */
export interface TextFieldProps extends AriaTextFieldProps {
  /** Visible field label, associated with the input for assistive tech. */
  label: ReactNode;
  /** Optional helper text shown below the input. */
  description?: ReactNode;
  /**
   * Validation message shown when the field is invalid. Accepts a string or a
   * function of RAC's validation state (for native-constraint messages).
   */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Placeholder text shown in the empty input. */
  placeholder?: string;
  /** Extra class names, merged after the field class. */
  className?: string;
}

// RAC's FieldError render-prop arg type, re-derived locally to avoid leaking the
// import into the public surface.
type ValidationResult = Parameters<
  Extract<
    NonNullable<React.ComponentProps<typeof FieldError>["children"]>,
    (...args: never[]) => unknown
  >
>[0];

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, description, errorMessage, placeholder, className, ...props },
    ref,
  ) {
    return (
      <AriaTextField
        className={className ? `${styles.field} ${className}` : styles.field}
        {...props}
      >
        <Label className={styles.label}>{label}</Label>
        <Input ref={ref} className={styles.input} placeholder={placeholder} />
        {description ? (
          <Text slot="description" className={styles.description}>
            {description}
          </Text>
        ) : null}
        <FieldError className={styles.error}>{errorMessage}</FieldError>
      </AriaTextField>
    );
  },
);
