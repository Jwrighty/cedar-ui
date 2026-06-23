"use client";

import { forwardRef, type CSSProperties } from "react";
import {
  DialogTrigger,
  Popover as AriaPopover,
  type DialogTriggerProps,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { Button, type ButtonProps } from "./Button";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Popover.module.css";

const popover = recipe({
  base: styles.popover,
  variants: {
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
});

type PopoverVariants = VariantProps<{
  size: { sm: string; md: string; lg: string };
}>;

/** Props for {@link Popover.Root}. */
export interface PopoverRootProps extends DialogTriggerProps {
  /**
   * Whether the popover is open when controlled. Pair with `onOpenChange`.
   */
  isOpen?: boolean;
  /** Whether the popover is initially open when uncontrolled. */
  defaultOpen?: boolean;
  /** Called whenever the user or application requests an open-state change. */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Owns the trigger/content relationship and controlled or uncontrolled open
 * state. Positioning, dismissal, focus containment, and focus restoration are
 * delegated to React Aria Components.
 */
function Root(props: PopoverRootProps) {
  return <DialogTrigger {...props} />;
}

/** Props for {@link Popover.Trigger}. */
export interface PopoverTriggerProps extends ButtonProps {
  /** The trigger's visible label or content. */
  children: ButtonProps["children"];
}

/**
 * Opens the popover on press. Renders a Cedar {@link Button} and accepts all
 * Button props, including `variant`, `size`, `className`, and `style`.
 */
const Trigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function Trigger(props, ref) {
    return <Button ref={ref} {...props} />;
  },
);

/** Props for {@link Popover.Content}. */
export interface PopoverContentProps extends Omit<
  AriaPopoverProps,
  "className" | "style"
> {
  /** Maximum inline size of the overlay surface. @default "md" */
  size?: PopoverVariants["size"];
  /** Extra class names, merged after Cedar's surface and size classes. */
  className?: string;
  /** Inline styles forwarded to the portalled overlay surface. */
  style?: CSSProperties;
}

/**
 * A token-styled overlay surface anchored to {@link Popover.Trigger}.
 *
 * React Aria handles placement, collision avoidance, outside-click and Escape
 * dismissal, focus containment, focus restoration, and portal rendering. The
 * surface accepts RAC positioning props such as `placement`, `offset`, and
 * `shouldFlip`. Because it is portalled to `document.body`, apply `data-theme`
 * directly when the active theme does not live on `html` or `body`.
 */
const Content = forwardRef<HTMLElement, PopoverContentProps>(function Content(
  { size = "md", className, style, ...props },
  ref,
) {
  const { className: variantClass, dataAttrs } = popover({ size });

  return (
    <AriaPopover
      ref={ref}
      className={className ? `${variantClass} ${className}` : variantClass}
      style={style}
      {...dataAttrs}
      {...props}
    />
  );
});

/**
 * Anchored, dismissible content exposed as a compound Primitive.
 *
 * @example
 * <Popover.Root>
 *   <Popover.Trigger>View details</Popover.Trigger>
 *   <Popover.Content aria-label="Project details">
 *     <p>Last updated today.</p>
 *     <Button>Open project</Button>
 *   </Popover.Content>
 * </Popover.Root>
 */
export const Popover = { Root, Trigger, Content };
