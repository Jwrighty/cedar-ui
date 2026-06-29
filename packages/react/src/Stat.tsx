"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Card, type CardProps } from "./Card";
import styles from "./Stat.module.css";

export type StatDeltaDirection = "positive" | "negative" | "neutral";

export interface StatDelta {
  /** Directional semantic treatment for the delta. */
  direction: StatDeltaDirection;
  /** Text displayed next to the value. */
  value: ReactNode;
}

/** Props for a composed metric card. */
export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  /** Short muted label for the metric. */
  label: ReactNode;
  /** Main metric value. */
  value: ReactNode;
  /** Optional directional delta. */
  delta?: StatDelta;
  /** Optional chart, sparkline, or loading placeholder slot. */
  visual?: ReactNode;
  /** Inset applied to the metric surface. @default "xl" */
  padding?: CardProps["padding"];
}

const deltaClass = (direction: StatDeltaDirection) =>
  `${styles.delta} ${styles[direction]}`;

/**
 * A composed metric card built from Card.
 *
 * Stat adds opinionated metric typography and semantic delta colour, but no new
 * low-level surface behaviour.
 *
 * @example
 * <Stat label="Runs" value="1,248" delta={{ direction: "positive", value: "+8%" }} />
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, delta, visual, className, padding = "xl", ...props },
  ref,
) {
  return (
    <Card
      ref={ref}
      className={className ? `${styles.stat} ${className}` : styles.stat}
      padding={padding}
      {...props}
    >
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.header}>
            <p className={styles.label}>{label}</p>
            {delta ? (
              <div
                className={deltaClass(delta.direction)}
                data-direction={delta.direction}
              >
                {delta.value}
              </div>
            ) : null}
          </div>
          <div className={styles.value}>{value}</div>
        </div>
        {visual ? <div className={styles.visual}>{visual}</div> : null}
      </div>
    </Card>
  );
});

/** Alias for product language that prefers "metric" over "stat". */
export const MetricCard = Stat;
export type MetricCardProps = StatProps;
