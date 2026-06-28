"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Table.module.css";

const tableRoot = recipe({
  base: styles.table,
  variants: {
    density: {
      compact: styles.compact,
      comfortable: styles.comfortable,
    },
  },
});

const cell = recipe({
  base: styles.cell,
  variants: {
    align: {
      start: styles.start,
      center: styles.center,
      end: styles.end,
    },
    density: {
      compact: styles.compact,
      comfortable: styles.comfortable,
    },
  },
});

const headerCell = recipe({
  base: styles.headerCell,
  variants: {
    align: {
      start: styles.start,
      center: styles.center,
      end: styles.end,
    },
    density: {
      compact: styles.compact,
      comfortable: styles.comfortable,
    },
  },
});

type TableDensity = VariantProps<{
  density: { compact: string; comfortable: string };
}>["density"];

type TableAlign = VariantProps<{
  align: { start: string; center: string; end: string };
}>["align"];

/** Props for the presentational table element. */
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Density applied to descendant Cedar table cells. @default "comfortable" */
  density?: TableDensity;
}

/** Props for a presentational table row. */
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Enables hover treatment for app-controlled clickable rows. @default false */
  isInteractive?: boolean;
}

/** Shared cell props for body and header cells. */
export interface TableCellProps extends Omit<
  TdHTMLAttributes<HTMLTableCellElement>,
  "align"
> {
  /** Horizontal alignment. @default "start" */
  align?: TableAlign;
  /** Cell density when not inheriting from Table. @default "comfortable" */
  density?: TableDensity;
  /** Enables tabular-numeral typography. @default false */
  isNumeric?: boolean;
}

/** Header cell props. */
export interface TableHeaderCellProps extends Omit<
  ThHTMLAttributes<HTMLTableCellElement>,
  "align"
> {
  /** Horizontal alignment. @default "start" */
  align?: TableAlign;
  /** Cell density when not inheriting from Table. @default "comfortable" */
  density?: TableDensity;
  /** Enables tabular-numeral typography. @default false */
  isNumeric?: boolean;
}

const withClassName = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

/**
 * A styled native table for product code to populate with its own data logic.
 *
 * Cedar table primitives provide presentation only; sorting, filtering,
 * virtualisation, and row models stay in the consuming app.
 *
 * @example
 * <Table><tbody><TableRow><TableCell>run_123</TableCell></TableRow></tbody></Table>
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = "comfortable", className, ...props },
  ref,
) {
  const { className: variantClass, dataAttrs } = tableRoot({ density });

  return (
    <table
      ref={ref}
      className={className ? `${variantClass} ${className}` : variantClass}
      {...dataAttrs}
      {...props}
    />
  );
});

/** Presentational table row for app-owned table state. */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ isInteractive = false, className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={withClassName(styles.row, className)}
        data-interactive={isInteractive ? "true" : undefined}
        {...props}
      />
    );
  },
);

/** Styled column header cell. */
export const TableHeaderCell = forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps
>(function TableHeaderCell(
  {
    align = "start",
    density = "comfortable",
    isNumeric = false,
    className,
    ...props
  },
  ref,
) {
  const { className: variantClass, dataAttrs } = headerCell({
    align,
    density,
  });

  return (
    <th
      ref={ref}
      className={withClassName(
        variantClass,
        isNumeric && styles.numeric,
        className,
      )}
      data-numeric={isNumeric ? "true" : undefined}
      {...dataAttrs}
      {...props}
    />
  );
});

/** Styled body cell with optional tabular-numeral treatment. */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell(
    {
      align = "start",
      density = "comfortable",
      isNumeric = false,
      className,
      ...props
    },
    ref,
  ) {
    const { className: variantClass, dataAttrs } = cell({ align, density });

    return (
      <td
        ref={ref}
        className={withClassName(
          variantClass,
          isNumeric && styles.numeric,
          className,
        )}
        data-numeric={isNumeric ? "true" : undefined}
        {...dataAttrs}
        {...props}
      />
    );
  },
);
