import type {
  CedarManifest,
  ComponentExample,
  ComponentSummary,
  ManifestComponent,
  TokenMatch,
  TokenNode,
  TokenReference,
  TokenSource,
} from "./types.js";

/**
 * Condense every component in the manifest to its name, summary, status, and
 * public exports — the catalogue an agent scans before drilling into one.
 */
export function listComponents(manifest: CedarManifest): ComponentSummary[] {
  return manifest.components.map((component) => ({
    name: component.name,
    summary: component.summary,
    status: component.status,
    exports: component.exports,
  }));
}

/**
 * Look up the full {@link ManifestComponent} for a component by its name or any
 * of its public exports (case-insensitive). Throws — listing the available
 * components — when nothing matches, so the agent gets an actionable error.
 */
export function getComponentUsage(
  manifest: CedarManifest,
  name: string,
): ManifestComponent {
  const normalizedName = normalize(name);
  const component = manifest.components.find(
    (candidate) =>
      normalize(candidate.name) === normalizedName ||
      candidate.exports.some(
        (exportName) => normalize(exportName) === normalizedName,
      ),
  );

  if (!component) {
    const available = manifest.components
      .map((candidate) => candidate.name)
      .join(", ");
    throw new Error(
      `Unknown Cedar component "${name}". Available components: ${available}.`,
    );
  }

  return component;
}

/**
 * Look up the canonical TSX example for a component by name or export. This is
 * the narrow MCP response an agent can request when it already knows which
 * component it wants to use.
 */
export function getComponentExample(
  manifest: CedarManifest,
  name: string,
): ComponentExample {
  const component = getComponentUsage(manifest, name);

  return {
    component: component.name,
    ...component.canonicalExample,
  };
}

/**
 * Return Cedar's token reference. With no query, returns every token source
 * untouched; with a query, returns the sources that match plus the individual
 * token hits, searching path, tier, category, theme, type, value, and
 * description (all case-insensitive).
 */
export function getTokens(
  manifest: CedarManifest,
  query?: string,
): TokenReference {
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return {
      sources: manifest.tokens.sources,
    };
  }

  return {
    query,
    sources: manifest.tokens.sources.filter((source) =>
      sourceMatches(source, normalizedQuery),
    ),
    matches: manifest.tokens.sources.flatMap((source) =>
      flattenTokenMatches(source).filter((match) =>
        tokenMatchMatches(match, normalizedQuery),
      ),
    ),
  };
}

function sourceMatches(source: TokenSource, query: string): boolean {
  return (
    source.path.toLowerCase().includes(query) ||
    source.tier.toLowerCase().includes(query) ||
    source.category.toLowerCase().includes(query) ||
    Boolean(source.theme?.toLowerCase().includes(query)) ||
    flattenTokenMatches(source).some((match) => tokenMatchMatches(match, query))
  );
}

function flattenTokenMatches(source: TokenSource): TokenMatch[] {
  const matches: TokenMatch[] = [];

  visitTokenNode(source.tokens, [], (path, token) => {
    matches.push({
      source: tokenSourceReference(source),
      name: path.join("."),
      value: token.$value,
      type: token.$type,
      description: token.$description,
    });
  });

  return matches;
}

function tokenSourceReference(source: TokenSource): TokenMatch["source"] {
  return {
    path: source.path,
    tier: source.tier,
    ...(source.theme ? { theme: source.theme } : {}),
    category: source.category,
  };
}

function visitTokenNode(
  node: TokenNode,
  path: string[],
  onToken: (
    path: string[],
    token: Extract<TokenNode, { $value: unknown }>,
  ) => void,
) {
  if (isToken(node)) {
    onToken(path, node);
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    visitTokenNode(child, [...path, key], onToken);
  }
}

function isToken(
  node: TokenNode,
): node is Extract<TokenNode, { $value: unknown }> {
  return typeof node === "object" && node !== null && "$value" in node;
}

function tokenMatchMatches(match: TokenMatch, query: string): boolean {
  return [
    match.name,
    match.type,
    match.description,
    String(match.value),
    match.source.path,
    match.source.tier,
    match.source.theme,
    match.source.category,
  ].some((value) => value?.toLowerCase().includes(query));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
