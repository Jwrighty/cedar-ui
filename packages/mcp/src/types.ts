export interface CedarManifest {
  schemaVersion: number;
  name: string;
  description?: string;
  packages: {
    react: PackageReference;
    tokens: PackageReference;
  };
  generatedFrom: Record<string, string>;
  components: ComponentMeta[];
  tokens: {
    sources: TokenSource[];
  };
}

export interface PackageReference {
  name: string;
  version: string;
}

export interface ComponentMeta {
  name: string;
  exports: string[];
  status: "experimental" | "stable" | "deprecated";
  summary: string;
  useWhen: string[];
  avoidWhen: AvoidWhenRule[];
  a11yNotes: string[];
  relatedComponents: string[];
  source?: string;
  props: PropSignature[];
  variants: VariantSignature[];
}

export interface AvoidWhenRule {
  situation: string;
  useInstead: string;
}

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

export interface VariantSignature {
  name: string;
  options: string[];
}

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

export interface ComponentSummary {
  name: string;
  summary: string;
  status: ComponentMeta["status"];
  exports: string[];
}

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

export interface TokenReference {
  query?: string;
  sources: TokenSource[];
  matches?: TokenMatch[];
}
