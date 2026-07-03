import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultManifestPath = path.join(repoRoot, "cedar.manifest.json");
const defaultLimit = 16;

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArgs(argv);

    if (options.help) {
      console.log(renderHelp());
      return;
    }

    const manifest = await loadManifest(options.manifestPath);
    const output =
      options.mode === "token"
        ? renderDenseTokens(manifest, options.target, { limit: options.limit })
        : renderDenseComponent(manifest, options.target, {
            propLimit: options.limit,
          });

    console.log(output);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

export function parseArgs(argv) {
  const args = [...argv];
  let manifestPath = defaultManifestPath;
  let limit = defaultLimit;
  let help = false;
  const positionals = [];

  while (args.length > 0) {
    const arg = args.shift();

    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg === "--manifest") {
      const value = args.shift();
      if (!value) {
        throw new Error("Missing value for --manifest.");
      }
      manifestPath = path.resolve(value);
      continue;
    }

    if (arg === "--limit") {
      const value = args.shift();
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error("--limit must be a positive integer.");
      }
      limit = parsed;
      continue;
    }

    if (arg?.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    positionals.push(arg);
  }

  if (help) {
    return { help, manifestPath, limit, mode: "component", target: "" };
  }

  if (positionals.length === 0) {
    throw new Error(
      `${renderHelp()}\n\nMissing component name or token query.`,
    );
  }

  const [first, ...rest] = positionals;
  const mode = first === "token" || first === "tokens" ? "token" : "component";
  const target =
    mode === "token"
      ? rest.join(" ")
      : first === "component" || first === "components"
        ? rest.join(" ")
        : positionals.join(" ");

  if (!target.trim()) {
    throw new Error(
      mode === "token" ? "Missing token query." : "Missing component name.",
    );
  }

  return {
    help,
    manifestPath,
    limit,
    mode,
    target: target.trim(),
  };
}

export async function loadManifest(manifestPath = defaultManifestPath) {
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

export function renderDenseComponent(manifest, name, { propLimit = 12 } = {}) {
  const component = findComponent(manifest, name);
  const packageRef = manifest.packages?.react;
  const lines = [
    `Cedar component: ${component.name}`,
    packageRef ? `Package: ${packageRef.name}@${packageRef.version}` : "",
    `Status: ${component.status}`,
    `Exports: ${component.exports.map(formatCode).join(", ")}`,
    `Summary: ${component.summary}`,
    "",
    renderList("Use when", component.useWhen),
    renderAvoidWhen(component.avoidWhen),
    renderList("Accessibility", component.a11yNotes),
    renderKeyProps(component.props, propLimit),
    renderVariants(component.variants),
    renderList("Related", component.relatedComponents, {
      inline: true,
      formatter: formatCode,
    }),
    renderCanonicalExample(component.canonicalExample),
  ];

  return compactLines(lines).join("\n");
}

export function renderDenseTokens(
  manifest,
  query,
  { limit = defaultLimit } = {},
) {
  const matches = findTokenMatches(manifest, query);
  const shown = matches.slice(0, limit);
  const packageRef = manifest.packages?.tokens;
  const lines = [
    `Cedar tokens: ${query}`,
    packageRef ? `Package: ${packageRef.name}@${packageRef.version}` : "",
    `Matches: ${matches.length}${matches.length > shown.length ? ` (showing ${shown.length})` : ""}`,
    "",
    ...shown.map(renderTokenMatch),
  ];

  if (matches.length > shown.length) {
    lines.push(
      `... ${matches.length - shown.length} more matches. Narrow the query or raise --limit.`,
    );
  }

  if (matches.length === 0) {
    lines.push(
      "No token matches. Try a path, tier, category, theme, type, value, or description.",
    );
  }

  return compactLines(lines).join("\n");
}

export function findTokenMatches(manifest, query) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return (manifest.tokens?.sources ?? [])
    .flatMap((source) =>
      flattenTokenMatches(source).map((match) => ({
        ...match,
        source: {
          path: source.path,
          tier: source.tier,
          category: source.category,
          theme: source.theme,
        },
      })),
    )
    .filter((match) => tokenMatchMatches(match, normalizedQuery));
}

function findComponent(manifest, name) {
  const normalizedName = normalize(name);
  const component = manifest.components?.find(
    (candidate) =>
      normalize(candidate.name) === normalizedName ||
      candidate.exports?.some(
        (exportName) => normalize(exportName) === normalizedName,
      ),
  );

  if (!component) {
    const available = (manifest.components ?? [])
      .map((candidate) => candidate.name)
      .sort((a, b) => a.localeCompare(b))
      .join(", ");

    throw new Error(
      `Unknown Cedar component: ${name}. Available components: ${available}`,
    );
  }

  return component;
}

function renderList(label, items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  if (options.inline) {
    const formatter = options.formatter ?? ((item) => item);
    return `${label}: ${items.map(formatter).join(", ")}`;
  }

  return [`${label}:`, ...items.map((item) => `- ${item}`)].join("\n");
}

function renderAvoidWhen(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  return [
    "Avoid when:",
    ...items.map((item) => {
      const suffix = item.useInstead ? `; use ${item.useInstead} instead` : "";
      return `- ${item.situation}${suffix}.`;
    }),
  ].join("\n");
}

function renderKeyProps(propEntries = [], limit) {
  const props = dedupeProps(propEntries).slice(0, limit);

  if (props.length === 0) {
    return "";
  }

  const total = dedupeProps(propEntries).length;
  const lines = [
    "Key props:",
    ...props.map(
      (prop) =>
        `- ${prop.owner}.${prop.name}${renderRequired(prop)}: ${prop.type}${renderDefault(prop)}${renderDescription(prop)}`,
    ),
  ];

  if (total > props.length) {
    lines.push(`- ... ${total - props.length} more props in manifest.`);
  }

  return lines.join("\n");
}

function dedupeProps(propEntries = []) {
  const seen = new Set();
  const props = [];

  for (const entry of propEntries) {
    for (const prop of entry.properties ?? []) {
      const key = `${prop.name}\0${prop.type}\0${prop.default ?? ""}\0${prop.description ?? ""}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      props.push({
        ...prop,
        owner: entry.typeName,
      });
    }
  }

  return props.sort((a, b) => {
    if (a.required !== b.required) {
      return a.required ? -1 : 1;
    }

    if (Boolean(a.default) !== Boolean(b.default)) {
      return a.default ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}

function renderRequired(prop) {
  return prop.required ? " (required)" : "";
}

function renderDefault(prop) {
  return prop.default ? `; default ${prop.default}` : "";
}

function renderDescription(prop) {
  return prop.description ? ` - ${prop.description}` : "";
}

function renderVariants(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return "";
  }

  return [
    "Variants:",
    ...variants.map(
      (variant) =>
        `- ${variant.name}: ${variant.options.map(formatCode).join(", ")}`,
    ),
  ].join("\n");
}

function renderCanonicalExample(example) {
  if (!example?.code) {
    return "";
  }

  return [
    `Canonical example: ${example.source}`,
    "```tsx",
    example.code,
    "```",
  ].join("\n");
}

function flattenTokenMatches(source) {
  const matches = [];

  visitTokenNode(source.tokens, [], (pathSegments, token) => {
    matches.push({
      path: pathSegments.join("."),
      value: token.$value,
      type: token.$type,
      description: token.$description,
    });
  });

  return matches;
}

function visitTokenNode(node, pathSegments, onToken) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Object.hasOwn(node, "$value")) {
    onToken(pathSegments, node);
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    visitTokenNode(child, [...pathSegments, key], onToken);
  }
}

function tokenMatchMatches(match, query) {
  return [
    match.path,
    match.value,
    match.type,
    match.description,
    match.source.path,
    match.source.tier,
    match.source.category,
    match.source.theme,
  ].some((value) => normalize(String(value ?? "")).includes(query));
}

function renderTokenMatch(match) {
  const sourceParts = [
    match.source.tier,
    match.source.category,
    match.source.theme,
  ].filter(Boolean);
  const metadata = [match.type, match.description].filter(Boolean).join("; ");
  const suffix = metadata ? ` (${metadata})` : "";

  return `- ${match.path} = ${formatTokenValue(match.value)}${suffix} [${sourceParts.join("/")}: ${match.source.path}]`;
}

function formatTokenValue(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function formatCode(value) {
  return `\`${value}\``;
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

function compactLines(lines) {
  return lines.filter((line) => line !== "");
}

function renderHelp() {
  return [
    "Usage:",
    "  pnpm cedar:dense <component>",
    "  pnpm cedar:dense component <component>",
    "  pnpm cedar:dense token <query>",
    "",
    "Options:",
    "  --manifest <path>  Read a specific cedar.manifest.json.",
    `  --limit <count>    Limit dense props or token matches. Default: ${defaultLimit}.`,
  ].join("\n");
}

if (import.meta.url === pathToFileUrl(process.argv[1])) {
  await main();
}

function pathToFileUrl(filePath) {
  return filePath ? pathToFileURL(path.resolve(filePath)).href : "";
}
