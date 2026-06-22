/**
 * Tiny, dependency-free variant→className helper (ADR-0005). Maps a set of
 * variant props onto CSS-Module class names and emits matching `data-*`
 * attributes so CSS can target state either way. This is deliberately ~20 lines
 * and ours — no `cva`/Tailwind dependency.
 *
 * @example
 * const button = recipe({
 *   base: styles.button,
 *   variants: {
 *     variant: { primary: styles.primary, ghost: styles.ghost },
 *     size: { sm: styles.sm, md: styles.md },
 *   },
 * });
 * const { className, dataAttrs } = button({ variant: "primary", size: "md" });
 */
// Class values are `string | undefined` because CSS-Module lookups are under
// `noUncheckedIndexedAccess`; the helper simply skips any that are absent.
export type ClassName = string | undefined;
export type VariantMap = Record<string, Record<string, ClassName>>;

export type VariantProps<V extends VariantMap> = {
  [K in keyof V]: keyof V[K] & string;
};

export interface RecipeConfig<V extends VariantMap> {
  /** Class applied to every instance. */
  base: ClassName;
  /** variantName → (optionValue → className). */
  variants: V;
}

export interface RecipeResult {
  /** Space-joined CSS-Module class names for the selected variants. */
  className: string;
  /** `data-<variant>="<value>"` attributes mirroring the selection. */
  dataAttrs: Record<string, string>;
}

export function recipe<V extends VariantMap>(config: RecipeConfig<V>) {
  return (props: VariantProps<V>): RecipeResult => {
    const classes: string[] = [];
    if (config.base) classes.push(config.base);
    const dataAttrs: Record<string, string> = {};
    for (const name in config.variants) {
      const value = props[name];
      const className = config.variants[name]?.[value];
      if (className) classes.push(className);
      dataAttrs[`data-${name}`] = value;
    }
    return { className: classes.join(" "), dataAttrs };
  };
}
