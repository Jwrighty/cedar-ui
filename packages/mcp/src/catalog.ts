import type {
  CedarManifest,
  ComponentMeta,
  ComponentSummary,
  TokenMatch,
  TokenNode,
  TokenReference,
  TokenSource,
} from "./types.js";

export function listComponents(manifest: CedarManifest): ComponentSummary[] {
  return manifest.components.map((component) => ({
    name: component.name,
    summary: component.summary,
    status: component.status,
    exports: component.exports,
  }));
}

export function getComponentUsage(
  manifest: CedarManifest,
  name: string,
): ComponentMeta {
  const normalizedName = normalize(name);
  const component = manifest.components.find(
    (candidate) =>
      normalize(candidate.name) === normalizedName ||
      candidate.exports.some((exportName) => normalize(exportName) === normalizedName),
  );

  if (!component) {
    const available = manifest.components.map((candidate) => candidate.name).join(", ");
    throw new Error(`Unknown Cedar component "${name}". Available components: ${available}.`);
  }

  return component;
}

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

function isToken(node: TokenNode): node is Extract<TokenNode, { $value: unknown }> {
  return (
    typeof node === "object" &&
    node !== null &&
    "$value" in node
  );
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
