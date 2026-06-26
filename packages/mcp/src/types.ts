import type { ComponentMeta } from "@jwrighty/cedar-react";

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
 * A single component entry in the manifest: the human-authored
 * {@link ComponentMeta} (the single source of truth co-located with each
 * component, per ADR-0009) plus the fields the generator derives from the
 * source — its export names, originating module, prop types, and variants.
 * Extending `ComponentMeta` keeps the authored fields tied to their owner so
 * the two cannot drift apart.
 */
export interface ManifestComponent extends ComponentMeta {
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
  status: ComponentMeta["status"];
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
