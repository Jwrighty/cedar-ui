"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Card.module.css";

const card = recipe({
  base: styles.card,
  variants: {
    padding: {
      none: styles.paddingNone,
      sm: styles.paddingSm,
      md: styles.paddingMd,
      lg: styles.paddingLg,
    },
  },
});

type CardVariants = VariantProps<{
  padding: { none: string; sm: string; md: string; lg: string };
}>;

/** Props for the Card surface primitive. */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Inset applied to direct card content. Use "none" with Card slots. @default "none" */
  padding?: CardVariants["padding"];
}

/**
 * A token-backed outlined surface for grouping related content.
 *
 * Use `CardHeader`, `CardBody`, and `CardFooter` when the surface needs
 * distinct regions, or pass children directly with a padding value for a simple
 * framed panel.
 *
 * @example
 * <Card><CardBody>Summary</CardBody></Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = "none", className, ...props },
  ref,
) {
  const { className: variantClass, dataAttrs } = card({ padding });

  return (
    <div
      ref={ref}
      className={className ? `${variantClass} ${className}` : variantClass}
      {...dataAttrs}
      {...props}
    />
  );
});

export type CardSectionProps = HTMLAttributes<HTMLDivElement>;

const sectionClass = (slotClass: string | undefined, className?: string) =>
  [styles.section, slotClass, className].filter(Boolean).join(" ");

/** Header slot for titles, summaries, or compact actions. */
export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={sectionClass(styles.header, className)}
        {...props}
      />
    );
  },
);

/** Body slot for the card's primary content. */
export const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardBody({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={sectionClass(styles.body, className)}
        {...props}
      />
    );
  },
);

/** Footer slot for secondary actions or supporting details. */
export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={sectionClass(styles.footer, className)}
        {...props}
      />
    );
  },
);
