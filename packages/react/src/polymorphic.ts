import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
} from "react";

/** Native props for a polymorphic Cedar layout primitive. */
export type PolymorphicProps<E extends ElementType, OwnProps> = OwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof OwnProps>;

/** Ref type for the element selected by a polymorphic `as` prop. */
export type PolymorphicRef<E extends ElementType> =
  ComponentPropsWithRef<E>["ref"];
