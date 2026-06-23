"use client";

import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import styles from "./Checkbox.module.css";

/**
 * Props for Cedar's Checkbox Primitive.
 *
 * State follows React Aria's conventions: use `isSelected`, `defaultSelected`,
 * `isIndeterminate`, `isDisabled`, `isInvalid`, and `onChange` rather than DOM
 * checkbox prop names.
 */
export interface CheckboxProps extends Omit<
  AriaCheckboxProps,
  "children" | "className" | "inputRef"
> {
  /** Visible label associated with the checkbox input. */
  children: ReactNode;
  /** Extra class names, merged after the Checkbox class. */
  className?: string;
}

/**
 * A labelled binary form control built on React Aria Components.
 *
 * Supports controlled and uncontrolled selection, indeterminate display,
 * validation, disabled state, and keyboard interaction. Interaction state is
 * exposed through React Aria's `data-*` attributes and styled against Cedar's
 * design tokens, so it re-themes via `[data-theme]` with no component changes.
 * The forwarded ref reaches the native checkbox input.
 *
 * @example
 * <Checkbox defaultSelected onChange={setAccepted}>Accept terms</Checkbox>
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ children, className, ...props }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    return (
      <AriaCheckbox
        inputRef={inputRef}
        className={
          className ? `${styles.checkbox} ${className}` : styles.checkbox
        }
        {...props}
      >
        {({ isIndeterminate, isSelected }) => (
          <>
            <span className={styles.indicator} aria-hidden="true">
              {isIndeterminate ? (
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="M3 8h10" />
                </svg>
              ) : isSelected ? (
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="m3 8 3 3 7-7" />
                </svg>
              ) : null}
            </span>
            <span className={styles.label}>{children}</span>
          </>
        )}
      </AriaCheckbox>
    );
  },
);
