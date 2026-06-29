/**
 * The shape of `cedar.manifest.json`, the generated artifact the MCP server
 * reads. Produced by `@jwrighty/cedar-react`'s agent-surface generator
 * (ADR-0009); this is the consumer-side view of that contract.
 */
export interface CedarManifest {
  schemaVersion: number;
  name: string;
  description?: string;
  packages: {
    react: PackageReference;
    tokens: PackageReference;
  };
  generatedFrom: Record<string, string>;
  components: ManifestComponent[];
  tokens: {
    sources: TokenSource[];
  };
}

/** A published package and the version the manifest was generated from. */
export interface PackageReference {
  name: string;
  version: string;
}

/**
 * The manifest copy of Cedar's per-component usage metadata. This mirrors the
 * React package's `ComponentMeta` contract, but stays local so the MCP server
 * can typecheck before `@jwrighty/cedar-react` has emitted declaration files.
 */
export interface ManifestComponentMeta {
  summary: string;
  useWhen: string[];
  avoidWhen: { situation: string; useInstead: string }[];
  a11yNotes: string[];
  relatedComponents: string[];
  status: "experimental" | "stable" | "deprecated";
}

/**
 * A single component entry in the manifest: the human-authored
 * {@link ManifestComponentMeta} (generated from the single source of truth
 * co-located with each
 * component, per ADR-0009) plus the fields the generator derives from the
 * source — its export names, originating module, prop types, and variants.
 */
export interface ManifestComponent extends ManifestComponentMeta {
  name: string;
  exports: string[];
  source?: string;
  props: PropSignature[];
  variants: VariantSignature[];
}

/** A generated type signature for a component's props. */
export interface PropSignature {
  typeName: string;
  kind: "interface" | "type";
  exported: boolean;
  description?: string;
  extends: string[];
  type?: string;
  properties: PropProperty[];
}

export interface PropProperty {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

/** A generated variant axis for a component and its allowed options. */
export interface VariantSignature {
  name: string;
  options: string[];
}

/** One token file in the manifest: its location, classification, and tree. */
export interface TokenSource {
  path: string;
  tier: string;
  theme?: string;
  category: string;
  tokens: TokenTree;
}

export interface TokenTree {
  [key: string]: TokenNode;
}

export type TokenNode =
  | {
      $value: unknown;
      $type?: string;
      $description?: string;
    }
  | TokenTree;

/** The condensed view of a component returned by `list_components`. */
export interface ComponentSummary {
  name: string;
  summary: string;
  status: ManifestComponentMeta["status"];
  exports: string[];
}

/** A single token flattened out of a {@link TokenSource} tree by a query. */
export interface TokenMatch {
  source: {
    path: string;
    tier: string;
    theme?: string;
    category: string;
  };
  name: string;
  value: unknown;
  type?: string;
  description?: string;
}

/**
 * The result of `get_tokens`: the matching {@link TokenSource} files, plus —
 * when a query is supplied — the individual {@link TokenMatch} hits within them.
 */
export interface TokenReference {
  query?: string;
  sources: TokenSource[];
  matches?: TokenMatch[];
}
