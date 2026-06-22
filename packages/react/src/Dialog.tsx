"use client";

import { forwardRef, useContext, type ReactNode, type CSSProperties } from "react";
import {
  DialogTrigger,
  ModalOverlay,
  Modal,
  Dialog as AriaDialog,
  Heading,
  OverlayTriggerStateContext,
  type DialogTriggerProps,
  type ModalOverlayProps,
  type DialogProps as AriaDialogProps,
} from "react-aria-components";
import { Button, type ButtonProps } from "./Button";
import styles from "./Dialog.module.css";

/**
 * Modal dialog, exposed as a compound component built on React Aria (ADR-0005).
 *
 * `Dialog.Root` manages open state and connects the trigger to the overlay;
 * focus trap, dismiss-on-escape, dismiss-on-outside-click and scroll lock are
 * all delegated to React Aria — Cedar only styles them. Re-themes via
 * `[data-theme]` with no code change.
 *
 * @example
 * <Dialog.Root>
 *   <Dialog.Trigger>Delete…</Dialog.Trigger>
 *   <Dialog.Content>
 *     <Dialog.Title>Delete project?</Dialog.Title>
 *     <p>This cannot be undone.</p>
 *     <Dialog.Close variant="primary">Delete</Dialog.Close>
 *     <Dialog.Close>Cancel</Dialog.Close>
 *   </Dialog.Content>
 * </Dialog.Root>
 */
function Root(props: DialogTriggerProps) {
  return <DialogTrigger {...props} />;
}

/**
 * The element that opens the dialog. Renders a Cedar {@link Button} and is wired
 * to the dialog's open state by `Dialog.Root` — accepts all Button props.
 */
const Trigger = forwardRef<HTMLButtonElement, ButtonProps>(
  function Trigger(props, ref) {
    return <Button ref={ref} {...props} />;
  },
);

/** Props for {@link Dialog.Content}. */
export interface DialogContentProps
  extends Pick<
    ModalOverlayProps,
    | "isDismissable"
    | "isKeyboardDismissDisabled"
    | "isOpen"
    | "defaultOpen"
    | "onOpenChange"
  > {
  children: ReactNode;
  /** Dialog ARIA role. @default "dialog" */
  role?: AriaDialogProps["role"];
  /** Extra class names, merged onto the dialog panel. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The overlay + panel. Renders the React Aria `ModalOverlay` → `Modal` →
 * `Dialog` stack. Dismissable by default (escape / outside click); pass
 * `isDismissable={false}` for a blocking dialog.
 */
function Content({
  children,
  role,
  className,
  style,
  isDismissable = true,
  isKeyboardDismissDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
}: DialogContentProps) {
  return (
    <ModalOverlay
      className={styles.overlay}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Modal className={styles.modal}>
        <AriaDialog
          role={role}
          className={
            className ? `${styles.dialog} ${className}` : styles.dialog
          }
          style={style}
        >
          {children}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

/** Props for {@link Dialog.Title}. */
export interface DialogTitleProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Accessible dialog title. Rendered as a heading with `slot="title"`, which
 * React Aria uses to label the dialog (`aria-labelledby`).
 */
function Title({ children, className, style }: DialogTitleProps) {
  return (
    <Heading
      slot="title"
      className={className ? `${styles.title} ${className}` : styles.title}
      style={style}
    >
      {children}
    </Heading>
  );
}

/**
 * A button that closes the dialog. Renders a Cedar {@link Button} (secondary by
 * default) and calls the dialog's close action on press, after any `onPress` you
 * pass. Accepts all Button props.
 */
const Close = forwardRef<HTMLButtonElement, ButtonProps>(
  function Close({ variant = "secondary", onPress, ...props }, ref) {
    const state = useContext(OverlayTriggerStateContext);
    return (
      <Button
        ref={ref}
        variant={variant}
        onPress={(e) => {
          onPress?.(e);
          state?.close();
        }}
        {...props}
      />
    );
  },
);

/**
 * Compound modal dialog. See {@link Root} for the full example.
 */
export const Dialog = {
  Root,
  Trigger,
  Content,
  Title,
  Close,
};
