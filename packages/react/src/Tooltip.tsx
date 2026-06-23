"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps as AriaTooltipTriggerProps,
} from "react-aria-components";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Tooltip.module.css";

const tooltip = recipe({
  base: styles.tooltip,
  variants: {
    side: {
      top: styles.top,
      right: styles.right,
      bottom: styles.bottom,
      left: styles.left,
    },
  },
});

type TooltipVariants = VariantProps<{
  side: { top: string; right: string; bottom: string; left: string };
}>;

function placementSide(
  placement: AriaTooltipProps["placement"],
): TooltipVariants["side"] {
  const side = placement?.split(" ")[0] ?? "top";
  return side === "right" || side === "bottom" || side === "left"
    ? side
    : "top";
}

/** Props for {@link Tooltip.Trigger}. */
export interface TooltipTriggerProps extends AriaTooltipTriggerProps {
  /** The focusable trigger followed by its associated {@link Tooltip}. */
  children: ReactNode;
}

/**
 * Connects a focusable trigger to its tooltip and delegates hover/focus delays
 * and open state to React Aria Components.
 */
function Trigger(props: TooltipTriggerProps) {
  return <AriaTooltipTrigger {...props} />;
}

/** Props for {@link Tooltip}. */
export interface TooltipProps extends Omit<
  AriaTooltipProps,
  "children" | "className" | "style"
> {
  /** Supplementary, non-interactive text that describes the trigger. */
  children: ReactNode;
  /** Extra class names, merged after Cedar's placement classes. */
  className?: string;
  /** Inline styles merged with React Aria's overlay positioning styles. */
  style?: CSSProperties;
}

/**
 * Supplementary, non-interactive text for a focusable trigger. Hover/focus
 * behavior, warmup/cooldown delay, overlay positioning, and dismissal are
 * delegated to React Aria Components. Use `placement` to choose a preferred
 * side; React Aria may flip it when space is constrained.
 *
 * Because the overlay is portalled to `document.body`, pass `data-theme` to
 * this component when Cedar's theme attribute is not applied globally.
 *
 * @example
 * <Tooltip.Trigger>
 *   <Button aria-label="Save">💾</Button>
 *   <Tooltip>Save changes</Tooltip>
 * </Tooltip.Trigger>
 */
const Content = forwardRef<HTMLDivElement, TooltipProps>(function Content(
  { placement = "top", className, style, ...props },
  ref,
) {
  const side = placementSide(placement);
  const { className: variantClass, dataAttrs } = tooltip({ side });

  return (
    <AriaTooltip
      ref={ref}
      placement={placement}
      className={className ? `${variantClass} ${className}` : variantClass}
      style={style}
      {...dataAttrs}
      {...props}
    />
  );
});

/** Compound tooltip. The content component also exposes {@link Trigger}. */
export const Tooltip = Object.assign(Content, { Trigger });
