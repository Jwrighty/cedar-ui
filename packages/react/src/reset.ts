import type { ElementType } from "react";
import styles from "./reset.module.css";

const LIST_ELEMENTS = new Set(["ul", "ol", "menu"]);

/**
 * Returns the list-normalization reset class when a polymorphic layout
 * primitive renders as a native list element, otherwise `undefined`.
 *
 * Layout primitives (`Stack`, `Inline`) own only flow direction and gap; they
 * carry no box-model opinion. List elements are the one polymorphic target with
 * default `margin-block` / `padding-inline-start`, so they opt into this reset.
 */
export function listResetClass(as: ElementType | undefined): string | undefined {
  return typeof as === "string" && LIST_ELEMENTS.has(as)
    ? styles.reset
    : undefined;
}
