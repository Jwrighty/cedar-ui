import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const llmsTxtPath = path.join(repoRoot, "llms.txt");
const catalogModulePath = path.join(repoRoot, "packages/react/dist/index.js");

const componentBindings = [
  { name: "Box", exports: ["Box"], metaExport: "boxMeta" },
  { name: "Button", exports: ["Button"], metaExport: "buttonMeta" },
  { name: "Checkbox", exports: ["Checkbox"], metaExport: "checkboxMeta" },
  { name: "Dialog", exports: ["Dialog"], metaExport: "dialogMeta" },
  { name: "Heading", exports: ["Heading"], metaExport: "headingMeta" },
  { name: "Inline", exports: ["Inline"], metaExport: "inlineMeta" },
  { name: "Popover", exports: ["Popover"], metaExport: "popoverMeta" },
  {
    name: "RadioGroup",
    exports: ["RadioGroup", "Radio"],
    metaExport: "radioGroupMeta",
  },
  { name: "Stack", exports: ["Stack"], metaExport: "stackMeta" },
  { name: "Switch", exports: ["Switch"], metaExport: "switchMeta" },
  { name: "Tabs", exports: ["Tabs"], metaExport: "tabsMeta" },
  { name: "Text", exports: ["Text"], metaExport: "textMeta" },
  { name: "TextField", exports: ["TextField"], metaExport: "textFieldMeta" },
  { name: "Tooltip", exports: ["Tooltip"], metaExport: "tooltipMeta" },
];

const knownUnshippedAlternatives = new Set([
  "Accordion",
  "Disclosure",
  "Link",
  "Menu",
  "SearchField",
  "Select",
  "TextArea",
  "Toast",
  "ToggleButton",
]);

export function renderLlmsTxt(componentCatalog) {
  const sortedComponents = [...componentCatalog].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const publicExports = new Set(
    sortedComponents.flatMap((component) => component.exports),
  );

  return [
    "# Cedar",
    "",
    "Cedar is a React + TypeScript design system built from a framework-neutral token pipeline. Use the component catalog below as the shortest path to the public API: every entry is generated from co-located `ComponentMeta`, so summaries, usage guidance, alternatives, and accessibility notes stay aligned with the shipped components.",
    "",
    "## Core References",
    "",
    "- [Glossary and domain language](CONTEXT.md)",
    "- [Token reference](packages/tokens/README.md)",
    "- [Token source](packages/tokens/src/)",
    "- [Architecture decisions](docs/adr/)",
    "- [ADR-0009: Agent-consumable surface](docs/adr/0009-agent-consumable-surface-usage-metadata.md)",
    "- [React package README](packages/react/README.md)",
    "",
    "## Public Components",
    "",
    ...sortedComponents.flatMap((component) => {
      const { meta } = component;
      const exportList = component.exports.join(", ");
      const useWhen = meta.useWhen.join(" ");
      const avoidWhen = meta.avoidWhen
        .map((rule) => formatAvoidRule(rule, publicExports))
        .join(" ");

      return [
        `### ${component.name}`,
        "",
        `- **Exports:** \`${exportList}\``,
        `- **Status:** \`${meta.status}\``,
        `- **Summary:** ${meta.summary}`,
        `- **Use when:** ${useWhen}`,
        `- **Avoid when:** ${avoidWhen}`,
        `- **Accessibility:** ${meta.a11yNotes.join(" ")}`,
        meta.relatedComponents.length > 0
          ? `- **Related:** ${meta.relatedComponents.join(", ")}`
          : "- **Related:** None",
        "",
      ];
    }),
  ].join("\n");
}

function formatAvoidRule(rule, publicExports) {
  const baseRule = `${rule.situation}; use ${rule.useInstead} instead.`;
  const alternatives = rule.useInstead
    .match(/[A-Z][A-Za-z0-9.]*/g)
    ?.filter((name) => {
      const rootName = name.split(".")[0];
      return (
        knownUnshippedAlternatives.has(rootName) &&
        !publicExports.has(name) &&
        !publicExports.has(rootName)
      );
    });

  if (!alternatives || alternatives.length === 0) {
    return baseRule;
  }

  return `${baseRule} (${[...new Set(alternatives)].join(
    ", ",
  )} not currently listed in Cedar public components.)`;
}

async function readBuiltCatalog() {
  try {
    const reactPackage = await import(pathToFileURL(catalogModulePath).href);
    return buildComponentCatalog(reactPackage);
  } catch (error) {
    throw new Error(
      `Could not load ${path.relative(repoRoot, catalogModulePath)}. Run \`pnpm build\` before generating agent artifacts.\n${error.message}`,
    );
  }
}

export function buildComponentCatalog(reactPackage) {
  const catalog = componentBindings.map((binding) => {
    const meta = reactPackage[binding.metaExport];

    if (!meta) {
      throw new Error(`Missing metadata export: ${binding.metaExport}`);
    }

    return {
      name: binding.name,
      exports: binding.exports,
      meta,
    };
  });

  assertPublicComponentCoverage(reactPackage, catalog);

  return catalog;
}

function assertPublicComponentCoverage(reactPackage, catalog) {
  const coveredExports = new Set(
    catalog.flatMap((component) => component.exports),
  );
  const publicComponentExports = Object.keys(reactPackage)
    .filter((name) => /^[A-Z]/.test(name))
    .sort();
  const missingExports = publicComponentExports.filter(
    (name) => !coveredExports.has(name),
  );

  if (missingExports.length > 0) {
    throw new Error(
      `Agent component catalog is missing public exports: ${missingExports.join(
        ", ",
      )}`,
    );
  }
}

export async function generateLlmsTxt() {
  const componentCatalog = await readBuiltCatalog();
  return renderLlmsTxt(componentCatalog);
}

export async function writeLlmsTxt() {
  const contents = await generateLlmsTxt();
  await writeFile(llmsTxtPath, contents, "utf8");
}

export async function checkLlmsTxt() {
  const expected = await generateLlmsTxt();
  const actual = await readFile(llmsTxtPath, "utf8");

  if (actual !== expected) {
    throw new Error(
      "llms.txt is stale. Run `pnpm agent:surface` after updating component metadata.",
    );
  }
}

async function main() {
  const command = process.argv[2] ?? "generate";

  if (command === "generate") {
    await writeLlmsTxt();
    return;
  }

  if (command === "check") {
    await checkLlmsTxt();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
