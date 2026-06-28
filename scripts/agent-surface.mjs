import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const llmsTxtPath = path.join(repoRoot, "llms.txt");
const manifestPath = path.join(repoRoot, "cedar.manifest.json");
const manifestSchemaPath = path.join(repoRoot, "cedar.manifest.schema.json");
const packageManifestPath = path.join(
  repoRoot,
  "packages/react/cedar.manifest.json",
);
const packageManifestSchemaPath = path.join(
  repoRoot,
  "packages/react/cedar.manifest.schema.json",
);
const catalogModulePath = path.join(repoRoot, "packages/react/dist/index.js");
const reactSourceDir = path.join(repoRoot, "packages/react/src");
const tokenSourceDir = path.join(repoRoot, "packages/tokens/src");

const componentBindings = [
  {
    name: "Badge",
    exports: ["Badge", "StatusPill"],
    metaExport: "badgeMeta",
    sourceFile: "Badge.tsx",
    propTypeNames: ["BadgeProps", "StatusPillProps"],
  },
  {
    name: "Box",
    exports: ["Box"],
    metaExport: "boxMeta",
    sourceFile: "Box.tsx",
    propTypeNames: ["BoxProps"],
  },
  {
    name: "Button",
    exports: ["Button"],
    metaExport: "buttonMeta",
    sourceFile: "Button.tsx",
    propTypeNames: ["ButtonProps"],
  },
  {
    name: "Card",
    exports: ["Card", "CardHeader", "CardBody", "CardFooter"],
    metaExport: "cardMeta",
    sourceFile: "Card.tsx",
    propTypeNames: ["CardProps", "CardSectionProps"],
  },
  {
    name: "Checkbox",
    exports: ["Checkbox"],
    metaExport: "checkboxMeta",
    sourceFile: "Checkbox.tsx",
    propTypeNames: ["CheckboxProps"],
  },
  {
    name: "Dialog",
    exports: ["Dialog"],
    metaExport: "dialogMeta",
    sourceFile: "Dialog.tsx",
    propTypeNames: ["DialogContentProps", "DialogTitleProps"],
  },
  {
    name: "Heading",
    exports: ["Heading"],
    metaExport: "headingMeta",
    sourceFile: "Heading.tsx",
    propTypeNames: ["HeadingProps"],
  },
  {
    name: "Inline",
    exports: ["Inline"],
    metaExport: "inlineMeta",
    sourceFile: "Inline.tsx",
    propTypeNames: ["InlineProps"],
  },
  {
    name: "Popover",
    exports: ["Popover"],
    metaExport: "popoverMeta",
    sourceFile: "Popover.tsx",
    propTypeNames: [
      "PopoverRootProps",
      "PopoverTriggerProps",
      "PopoverContentProps",
    ],
  },
  {
    name: "RadioGroup",
    exports: ["RadioGroup", "Radio"],
    metaExport: "radioGroupMeta",
    sourceFile: "RadioGroup.tsx",
    propTypeNames: ["RadioGroupProps", "RadioProps"],
  },
  {
    name: "Skeleton",
    exports: ["Skeleton"],
    metaExport: "skeletonMeta",
    sourceFile: "Skeleton.tsx",
    propTypeNames: ["SkeletonProps"],
  },
  {
    name: "Stack",
    exports: ["Stack"],
    metaExport: "stackMeta",
    sourceFile: "Stack.tsx",
    propTypeNames: ["StackProps"],
  },
  {
    name: "Stat",
    exports: ["Stat", "MetricCard"],
    metaExport: "statMeta",
    sourceFile: "Stat.tsx",
    propTypeNames: [
      "StatProps",
      "StatDelta",
      "StatDeltaDirection",
      "MetricCardProps",
    ],
  },
  {
    name: "Switch",
    exports: ["Switch"],
    metaExport: "switchMeta",
    sourceFile: "Switch.tsx",
    propTypeNames: ["SwitchProps"],
  },
  {
    name: "Tabs",
    exports: ["Tabs"],
    metaExport: "tabsMeta",
    sourceFile: "Tabs.tsx",
    propTypeNames: [
      "TabsRootProps",
      "TabsListProps",
      "TabsTabProps",
      "TabsPanelProps",
    ],
  },
  {
    name: "Table",
    exports: ["Table", "TableRow", "TableHeaderCell", "TableCell"],
    metaExport: "tableMeta",
    sourceFile: "Table.tsx",
    propTypeNames: [
      "TableProps",
      "TableRowProps",
      "TableHeaderCellProps",
      "TableCellProps",
    ],
  },
  {
    name: "Text",
    exports: ["Text"],
    metaExport: "textMeta",
    sourceFile: "Text.tsx",
    propTypeNames: ["TextProps"],
  },
  {
    name: "TextField",
    exports: ["TextField"],
    metaExport: "textFieldMeta",
    sourceFile: "TextField.tsx",
    propTypeNames: ["TextFieldProps"],
  },
  {
    name: "Tooltip",
    exports: ["Tooltip"],
    metaExport: "tooltipMeta",
    sourceFile: "Tooltip.tsx",
    propTypeNames: ["TooltipTriggerProps", "TooltipProps"],
  },
  {
    name: "Toast",
    exports: ["Toast", "useToast"],
    metaExport: "toastMeta",
    sourceFile: "Toast.tsx",
    propTypeNames: [
      "ToastProviderProps",
      "ToastRegionProps",
      "ToastMessage",
      "ToastOptions",
      "ToastApi",
      "ToastVariant",
    ],
  },
];

const knownUnshippedAlternatives = new Set([
  "Accordion",
  "Disclosure",
  "Link",
  "Menu",
  "SearchField",
  "Select",
  "TextArea",
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

export function renderManifest({
  componentCatalog,
  componentDocs,
  tokenSources,
  packages,
}) {
  return {
    $schema: "./cedar.manifest.schema.json",
    schemaVersion: 1,
    name: "Cedar",
    description:
      "Agent-consumable manifest generated from Cedar ComponentMeta, source prop types, and DTCG token sources.",
    packages,
    generatedFrom: {
      components:
        "packages/react/src/*.meta.ts via packages/react/dist/index.js",
      props: "packages/react/src/*.tsx TSDoc and TypeScript signatures",
      tokens: "packages/tokens/src/**/*.json",
    },
    components: componentCatalog
      .map((component) => {
        const docs = componentDocs[component.name];

        return {
          name: component.name,
          exports: component.exports,
          status: component.meta.status,
          summary: component.meta.summary,
          useWhen: component.meta.useWhen,
          avoidWhen: component.meta.avoidWhen,
          a11yNotes: component.meta.a11yNotes,
          relatedComponents: component.meta.relatedComponents,
          source: docs?.source,
          props: docs?.props ?? [],
          variants: docs?.variants ?? [],
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
    tokens: {
      sources: tokenSources,
    },
  };
}

export function renderManifestSchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://github.com/Jwrighty/cedar-ui/cedar.manifest.schema.json",
    title: "Cedar agent manifest",
    type: "object",
    required: [
      "schemaVersion",
      "name",
      "packages",
      "generatedFrom",
      "components",
      "tokens",
    ],
    properties: {
      $schema: { type: "string" },
      schemaVersion: { type: "integer" },
      name: { type: "string" },
      description: { type: "string" },
      packages: {
        type: "object",
        required: ["react", "tokens"],
        additionalProperties: false,
        properties: {
          react: { $ref: "#/$defs/package" },
          tokens: { $ref: "#/$defs/package" },
        },
      },
      generatedFrom: {
        type: "object",
        required: ["components", "props", "tokens"],
        additionalProperties: { type: "string" },
      },
      components: {
        type: "array",
        items: { $ref: "#/$defs/component" },
      },
      tokens: {
        type: "object",
        required: ["sources"],
        properties: {
          sources: {
            type: "array",
            items: { $ref: "#/$defs/tokenSource" },
          },
        },
      },
    },
    $defs: {
      package: {
        type: "object",
        required: ["name", "version"],
        properties: {
          name: { type: "string" },
          version: { type: "string" },
        },
      },
      component: {
        type: "object",
        required: [
          "name",
          "exports",
          "status",
          "summary",
          "useWhen",
          "avoidWhen",
          "a11yNotes",
          "relatedComponents",
          "props",
          "variants",
        ],
        properties: {
          name: { type: "string" },
          exports: { type: "array", items: { type: "string" } },
          status: { enum: ["experimental", "stable", "deprecated"] },
          summary: { type: "string" },
          useWhen: { type: "array", items: { type: "string" } },
          avoidWhen: {
            type: "array",
            items: {
              type: "object",
              required: ["situation", "useInstead"],
              properties: {
                situation: { type: "string" },
                useInstead: { type: "string" },
              },
            },
          },
          a11yNotes: { type: "array", items: { type: "string" } },
          relatedComponents: { type: "array", items: { type: "string" } },
          source: { type: "string" },
          props: {
            type: "array",
            items: { $ref: "#/$defs/propSignature" },
          },
          variants: {
            type: "array",
            items: { $ref: "#/$defs/variant" },
          },
        },
      },
      propSignature: {
        type: "object",
        required: ["typeName", "kind", "exported", "properties"],
        properties: {
          typeName: { type: "string" },
          kind: { enum: ["interface", "type"] },
          exported: { type: "boolean" },
          description: { type: "string" },
          extends: { type: "array", items: { type: "string" } },
          type: { type: "string" },
          properties: {
            type: "array",
            items: { $ref: "#/$defs/prop" },
          },
        },
      },
      prop: {
        type: "object",
        required: ["name", "type", "required"],
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          required: { type: "boolean" },
          default: { type: "string" },
          description: { type: "string" },
        },
      },
      variant: {
        type: "object",
        required: ["name", "options"],
        properties: {
          name: { type: "string" },
          options: { type: "array", items: { type: "string" } },
        },
      },
      tokenSource: {
        type: "object",
        required: ["path", "tier", "category", "tokens"],
        properties: {
          path: { type: "string" },
          tier: { type: "string" },
          theme: { type: "string" },
          category: { type: "string" },
          tokens: { type: "object" },
        },
      },
    },
  };
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

async function readComponentDocs() {
  const docs = {};
  const sourcePaths = componentBindings.map((binding) =>
    path.join(reactSourceDir, binding.sourceFile),
  );
  const program = ts.createProgram(sourcePaths, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
  });
  const checker = program.getTypeChecker();

  for (const binding of componentBindings) {
    const sourcePath = path.join(reactSourceDir, binding.sourceFile);
    const sourceFile = program.getSourceFile(sourcePath);

    if (!sourceFile) {
      throw new Error(`Could not load React source file: ${sourcePath}`);
    }

    docs[binding.name] = {
      source: path.relative(repoRoot, sourcePath),
      props: binding.propTypeNames
        .map((typeName) => readPropSignature(sourceFile, checker, typeName))
        .filter(Boolean),
      variants: readVariants(sourceFile),
    };
  }

  return docs;
}

function readPropSignature(sourceFile, checker, typeName) {
  let match;

  visit(sourceFile, (node) => {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === typeName
    ) {
      match = node;
    }
  });

  if (!match) {
    return undefined;
  }

  const isInterface = ts.isInterfaceDeclaration(match);
  const typeNode = ts.isTypeAliasDeclaration(match) ? match.type : undefined;
  const symbol = checker.getSymbolAtLocation(match.name);
  const type = checker.getTypeAtLocation(match.name);

  return {
    typeName,
    kind: isInterface ? "interface" : "type",
    exported: hasExportModifier(match),
    description: symbol
      ? getSymbolDescription(checker, symbol)
      : getDescription(match),
    extends: isInterface
      ? (match.heritageClauses ?? []).flatMap((clause) =>
          clause.types.map((heritageType) => heritageType.getText(sourceFile)),
        )
      : [],
    type: typeNode ? typeNode.getText(sourceFile) : undefined,
    properties: checker
      .getPropertiesOfType(type)
      .filter(isAuthoredProperty)
      .map((prop) => readResolvedProp(checker, prop, sourceFile)),
  };
}

// Keep only props authored in Cedar's own source. The inherited surface —
// whether from `@types/react`'s HTMLAttributes (~275 of HeadingProps' 282
// members) or from react-aria-components, both of which re-declare the full
// DOM/ARIA/event prop set — is what produced the original 25k-line manifest.
// That surface is documented by reference through each signature's `extends`
// and `type` fields, so an agent knows where to look without us enumerating it.
function isAuthoredProperty(prop) {
  return Boolean(
    prop.declarations?.some((declaration) => {
      const fileName = declaration.getSourceFile().fileName;
      return (
        fileName.startsWith(`${repoRoot}/`) &&
        !fileName.includes("/node_modules/")
      );
    }),
  );
}

function readResolvedProp(checker, prop, fallbackNode) {
  const declaration =
    prop.valueDeclaration ?? prop.declarations?.[0] ?? fallbackNode;
  const type = checker.getTypeOfSymbolAtLocation(prop, declaration);
  const description = getSymbolDescription(checker, prop);
  const defaultValue = getDefaultTag(declaration);

  return stripUndefinedValues({
    name: prop.getName(),
    type: normalizeTypeString(
      checker.typeToString(type, declaration, ts.TypeFormatFlags.NoTruncation),
    ),
    required: !(prop.flags & ts.SymbolFlags.Optional),
    default: defaultValue,
    description,
  });
}

function readVariants(sourceFile) {
  const variants = [];

  visit(sourceFile, (node) => {
    if (
      !ts.isCallExpression(node) ||
      node.expression.getText(sourceFile) !== "recipe"
    ) {
      return;
    }

    const config = node.arguments[0];
    if (!config || !ts.isObjectLiteralExpression(config)) {
      return;
    }

    const variantsProperty = config.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) &&
        property.name.getText(sourceFile) === "variants",
    );

    if (
      !variantsProperty ||
      !ts.isPropertyAssignment(variantsProperty) ||
      !ts.isObjectLiteralExpression(variantsProperty.initializer)
    ) {
      return;
    }

    for (const variantProperty of variantsProperty.initializer.properties) {
      if (
        !ts.isPropertyAssignment(variantProperty) ||
        !ts.isObjectLiteralExpression(variantProperty.initializer)
      ) {
        continue;
      }

      variants.push({
        name: propertyNameText(sourceFile, variantProperty.name),
        options: variantProperty.initializer.properties
          .filter(ts.isPropertyAssignment)
          .map((option) => propertyNameText(sourceFile, option.name)),
      });
    }
  });

  return variants;
}

async function readTokenSources() {
  const files = (await listJsonFiles(tokenSourceDir)).sort();
  const sources = [];

  for (const filePath of files) {
    const relativePath = path.relative(repoRoot, filePath);
    const [tier, theme] = path
      .relative(tokenSourceDir, filePath)
      .split(path.sep);
    const category = path.basename(filePath, ".json");

    sources.push({
      path: relativePath,
      tier,
      theme: tier === "themes" ? theme : undefined,
      category,
      tokens: JSON.parse(await readFile(filePath, "utf8")),
    });
  }

  return sources;
}

async function listJsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listJsonFiles(entryPath)));
    } else if (entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }

  return files;
}

async function readPackageSummary(packageJsonPath) {
  const pkg = JSON.parse(await readFile(packageJsonPath, "utf8"));

  return {
    name: pkg.name,
    version: pkg.version,
  };
}

function visit(node, callback) {
  callback(node);
  ts.forEachChild(node, (child) => visit(child, callback));
}

function hasExportModifier(node) {
  return Boolean(
    node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    ),
  );
}

function getDescription(node) {
  return (
    node.jsDoc
      ?.map((doc) => jsDocCommentText(doc.comment))
      .filter(Boolean)
      .join("\n") ?? undefined
  );
}

function getSymbolDescription(checker, symbol) {
  const description = ts.displayPartsToString(
    symbol.getDocumentationComment(checker),
  );

  return description || undefined;
}

function getDefaultTag(node) {
  for (const doc of node.jsDoc ?? []) {
    for (const tag of doc.tags ?? []) {
      if (tag.tagName.getText() === "default") {
        return jsDocCommentText(tag.comment);
      }
    }
  }

  return undefined;
}

function jsDocCommentText(comment) {
  if (!comment) {
    return undefined;
  }

  if (typeof comment === "string") {
    return comment;
  }

  return comment
    .map((part) => part.text)
    .join("")
    .trim();
}

function propertyNameText(sourceFile, name) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }

  return name.getText(sourceFile);
}

function normalizeTypeString(type) {
  return type
    .replaceAll(`${repoRoot}/`, "")
    .replace(
      /import\("node_modules\/\.pnpm\/[^"]+\/node_modules\/([^"]+)"\)/g,
      'import("$1")',
    )
    .replace(/import\("node_modules\/([^"]+)"\)/g, 'import("$1")');
}

function stripUndefinedValues(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  );
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

export async function generateManifest() {
  const componentCatalog = await readBuiltCatalog();
  const [componentDocs, tokenSources, reactPackage, tokensPackage] =
    await Promise.all([
      readComponentDocs(),
      readTokenSources(),
      readPackageSummary(path.join(repoRoot, "packages/react/package.json")),
      readPackageSummary(path.join(repoRoot, "packages/tokens/package.json")),
    ]);

  return renderManifest({
    componentCatalog,
    componentDocs,
    tokenSources,
    packages: {
      react: reactPackage,
      tokens: tokensPackage,
    },
  });
}

export async function writeAgentSurface() {
  const llmsTxt = await generateLlmsTxt();
  const manifest = stableJson(await generateManifest());
  const manifestSchema = stableJson(renderManifestSchema());

  await writeFile(llmsTxtPath, llmsTxt, "utf8");
  await writeFile(manifestPath, manifest, "utf8");
  await writeFile(packageManifestPath, manifest, "utf8");
  await writeFile(manifestSchemaPath, manifestSchema, "utf8");
  await writeFile(packageManifestSchemaPath, manifestSchema, "utf8");
}

export async function checkAgentSurface() {
  // Only the repo-root copies are committed. The packages/react copies are
  // generated at publish time (`prepack`) and gitignored, so they may not
  // exist on a fresh checkout — don't assert them here.
  await assertFileFresh(llmsTxtPath, await generateLlmsTxt());
  await assertFileFresh(manifestPath, stableJson(await generateManifest()));
  await assertFileFresh(manifestSchemaPath, stableJson(renderManifestSchema()));
}

async function assertFileFresh(filePath, expected) {
  const actual = await readFile(filePath, "utf8");

  if (actual !== expected) {
    throw new Error(
      `${path.relative(
        repoRoot,
        filePath,
      )} is stale. Run \`pnpm agent:surface\` after updating component metadata, prop types, or tokens.`,
    );
  }
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function main() {
  const command = process.argv[2] ?? "generate";

  if (command === "generate") {
    await writeAgentSurface();
    return;
  }

  if (command === "check") {
    await checkAgentSurface();
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
