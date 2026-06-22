/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
// Merge vitest-axe's matchers into Vitest's assertion types. vitest-axe ships
// an augmentation against the legacy global `Vi` namespace, which Vitest 4's
// `expect(...)` no longer reads — so we augment the `vitest` module directly.
// The `<T = any>` signature must match Vitest's own `Assertion<T = any>` for
// declaration merging to apply.
import "vitest";
import type { AxeMatchers } from "vitest-axe/matchers";

declare module "vitest" {
  interface Assertion<T = any> extends AxeMatchers {}
}
