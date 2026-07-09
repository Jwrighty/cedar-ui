import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const llmsTxtPath = path.join(repoRoot, "llms.txt");
const manifestPath = path.join(repoRoot, "cedar.manifest.json");
const manifestSchemaPath = path.join(repoRoot, "cedar.manifest.schema.json");
const consumerAgentRulesDir = path.join(repoRoot, "agent-rules");
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
const canonicalExamplesPath = path.join(
  reactSourceDir,
  "canonical-examples.tsx",
);
const templateExamplesPath = path.join(
  reactSourceDir,
  "composition-templates.tsx",
);
const tokenSourceDir = path.join(repoRoot, "packages/tokens/src");

const consumerAgentRuleTargets = [
  {
    id: "claude",
    agent: "Claude Code",
    fileName: "CLAUDE.md",
    title: "CLAUDE.md for Cedar consumers",
  },
  {
    id: "cursor",
    agent: "Cursor",
    fileName: ".cursorrules",
    title: ".cursorrules for Cedar consumers",
  },
  {
    id: "codex",
    agent: "Codex",
    fileName: "AGENTS.md",
    title: "AGENTS.md for Cedar consumers",
  },
];

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
    name: "IconButton",
    exports: ["IconButton"],
    metaExport: "iconButtonMeta",
    sourceFile: "IconButton.tsx",
    propTypeNames: ["IconButtonProps"],
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

export function renderLlmsTxt(componentCatalog, templateCatalog = []) {
  const sortedComponents = [...componentCatalog].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const sortedTemplates = [...templateCatalog].sort((a, b) =>
    a.id.localeCompare(b.id),
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
        "- **Canonical example:**",
        "",
        "```tsx",
        component.canonicalExample.code,
        "```",
        "",
        ...renderExportExamples(component),
      ];
    }),
    "## Composition Templates",
    "",
    "Use these generated templates when assembling common multi-component Cedar layouts. Study the skeleton first, then fill in copy, fields, and handlers for the product context.",
    "",
    ...sortedTemplates.flatMap((template) => [
      `### ${template.id}`,
      "",
      `- **Status:** \`${template.status}\``,
      `- **Summary:** ${template.summary}`,
      `- **Use when:** ${template.useWhen.join(" ")}`,
      `- **Components:** ${template.components.map((name) => `\`${name}\``).join(", ")}`,
      "- **Skeleton:**",
      "",
      "```tsx",
      template.skeleton,
      "```",
      "",
      "- **Tested example:**",
      "",
      "```tsx",
      template.canonicalExample.code,
      "```",
      "",
    ]),
  ].join("\n");
}

export function renderConsumerAgentRules({ packages }) {
  return consumerAgentRuleTargets.map((target) => ({
    ...target,
    path: path.join(consumerAgentRulesDir, target.fileName),
    content: renderConsumerAgentRule({ target, packages }),
  }));
}

function renderConsumerAgentRule({ target, packages }) {
  const reactPackage = packages.react.name;
  const tokensPackage = packages.tokens.name;
  const mcpPackage = packages.mcp.name;
  const mcpCommand = packages.mcp.command;

  return [
    `# ${target.title}`,
    "",
    "These are generated rules for projects that consume Cedar. Copy this file to the matching root file in a consumer repo. Do not confuse it with Cedar's repo-internal contributor `AGENTS.md` or other maintainer instructions.",
    "",
    "## Source of Truth",
    "",
    `- Use Cedar's generated \`llms.txt\` for component summaries, usage guidance, accessibility notes, and tested examples.`,
    `- Use the Cedar MCP server from \`${mcpPackage}\` for live API detail while coding. Register the \`${mcpCommand}\` command with your MCP client when available.`,
    `- Prefer MCP tools or \`llms.txt\` over guessing component props, variants, token names, or template structure.`,
    "",
    "```json",
    "{",
    '  "mcpServers": {',
    '    "cedar": {',
    `      "command": "${mcpCommand}"`,
    "    }",
    "  }",
    "}",
    "```",
    "",
    "## Imports",
    "",
    `- Import Cedar React components only from \`${reactPackage}\`.`,
    `- Import Cedar token utilities only from \`${tokensPackage}\`.`,
    "- Import Cedar CSS once near the app root:",
    "",
    "```tsx",
    `import "${tokensPackage}/tokens.css";`,
    `import "${reactPackage}/styles.css";`,
    `import { Button } from "${reactPackage}";`,
    "```",
    "",
    "- Do not import from Cedar source files, package internals, generated `dist` paths, or copied component code.",
    "",
    "## Styling",
    "",
    "- Do not use inline styles to customize Cedar components.",
    "- Use CSS classes, app stylesheets, and Cedar CSS custom properties for layout and presentation.",
    "- Use Cedar tokens instead of magic values for color, spacing, radius, typography, motion, and component-level styling.",
    "- Prefer semantic or component tokens before reaching for base tokens.",
    "",
    "## React Aria Props",
    "",
    "- Preserve React Aria prop names on Cedar components.",
    "- Use `onPress`, not `onClick`, for Cedar press interactions such as `Button` and `IconButton`.",
    "- Use `isDisabled`, not `disabled`, for disabled Cedar controls.",
    "- Check `llms.txt`, the generated manifest, or the MCP server before renaming props to DOM-style alternatives.",
    "",
    "## Component Choice",
    "",
    "- Choose components from Cedar's public catalog before inventing local UI primitives.",
    "- Read each component's `useWhen`, `avoidWhen`, accessibility notes, and canonical example before composing new UI.",
    "- If a needed component is not in Cedar's public catalog, build the smallest app-local wrapper and keep it styled with Cedar tokens.",
    "",
    `Generated for ${target.agent}; source packages: \`${reactPackage}\`, \`${tokensPackage}\`, \`${mcpPackage}\`.`,
    "",
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
  templateCatalog = [],
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
      examples:
        "packages/react/src/canonical-examples.tsx exported example functions",
      templates:
        "packages/react/src/composition-templates.tsx TemplateMeta entries and exported example functions",
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
          canonicalExample: component.canonicalExample,
          exportExamples: component.exportExamples,
          source: docs?.source,
          props: docs?.props ?? [],
          variants: docs?.variants ?? [],
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
    templates: templateCatalog
      .map((template) => ({
        id: template.id,
        status: template.status,
        summary: template.summary,
        useWhen: template.useWhen,
        components: template.components,
        skeleton: template.skeleton,
        canonicalExample: template.canonicalExample,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
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
      "templates",
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
        required: ["components", "props", "templates", "tokens"],
        additionalProperties: { type: "string" },
      },
      components: {
        type: "array",
        items: { $ref: "#/$defs/component" },
      },
      templates: {
        type: "array",
        items: { $ref: "#/$defs/template" },
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
          "canonicalExample",
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
          canonicalExample: { $ref: "#/$defs/canonicalExample" },
          exportExamples: {
            type: "object",
            additionalProperties: { $ref: "#/$defs/canonicalExample" },
          },
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
      template: {
        type: "object",
        required: [
          "id",
          "status",
          "summary",
          "useWhen",
          "components",
          "skeleton",
          "canonicalExample",
        ],
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          status: { enum: ["experimental", "stable", "deprecated"] },
          summary: { type: "string" },
          useWhen: { type: "array", items: { type: "string" } },
          components: { type: "array", items: { type: "string" } },
          skeleton: { type: "string" },
          canonicalExample: { $ref: "#/$defs/canonicalExample" },
        },
      },
      canonicalExample: {
        type: "object",
        required: ["source", "code"],
        additionalProperties: false,
        properties: {
          source: { type: "string" },
          code: { type: "string" },
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
    const [reactPackage, canonicalExamples, templateExamples] =
      await Promise.all([
        import(pathToFileURL(catalogModulePath).href),
        readCanonicalExamples(),
        readTemplateExamples(),
      ]);
    return {
      componentCatalog: buildComponentCatalog(reactPackage, canonicalExamples),
      templateCatalog: buildTemplateCatalog(reactPackage, templateExamples),
    };
  } catch (error) {
    throw new Error(
      `Could not load ${path.relative(repoRoot, catalogModulePath)}. Run \`pnpm build\` before generating agent artifacts.\n${error.message}`,
    );
  }
}

async function readCanonicalExamples() {
  return readExampleFunctions({
    sourcePath: canonicalExamplesPath,
    suffix: "Example",
    toId: (functionName) => functionName.replace(/Example$/, ""),
  });
}

async function readTemplateExamples() {
  return readExampleFunctions({
    sourcePath: templateExamplesPath,
    suffix: "TemplateExample",
    toId: (functionName) =>
      toKebabCase(functionName.replace(/TemplateExample$/, "")),
  });
}

async function readExampleFunctions({ sourcePath, suffix, toId }) {
  const sourceText = await readFile(sourcePath, "utf8");
  const sourceFile = ts.createSourceFile(
    sourcePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const examples = {};

  visit(sourceFile, (node) => {
    if (!ts.isFunctionDeclaration(node) || !node.name) {
      return;
    }

    if (!node.name.text.endsWith(suffix)) {
      return;
    }

    const id = toId(node.name.text);

    examples[id] = {
      source: `${path.relative(repoRoot, sourcePath)}#${node.name.text}`,
      code: node
        .getText(sourceFile)
        .replace(/^export\s+/, "")
        .trim(),
    };
  });

  return examples;
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

async function readMcpPackageSummary(packageJsonPath) {
  const pkg = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const commands = Object.keys(pkg.bin ?? {});

  if (commands.length !== 1) {
    throw new Error(
      `${path.relative(
        repoRoot,
        packageJsonPath,
      )} must expose exactly one MCP command for generated consumer agent rules.`,
    );
  }

  return {
    name: pkg.name,
    version: pkg.version,
    command: commands[0],
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

export function buildComponentCatalog(reactPackage, canonicalExamples) {
  const catalog = componentBindings.map((binding) => {
    const meta = reactPackage[binding.metaExport];
    const exportExamples = Object.fromEntries(
      binding.exports
        .map((exportName) => [exportName, canonicalExamples?.[exportName]])
        .filter(([, example]) => example),
    );

    if (!meta) {
      throw new Error(`Missing metadata export: ${binding.metaExport}`);
    }

    return {
      name: binding.name,
      exports: binding.exports,
      meta,
      canonicalExample: exportExamples[binding.name],
      exportExamples,
    };
  });

  assertPublicComponentCoverage(reactPackage, catalog);

  if (canonicalExamples) {
    assertCanonicalExampleCoverage(catalog);
  }

  return catalog;
}

function renderExportExamples(component) {
  return component.exports.flatMap((exportName) => {
    if (exportName === component.name) {
      return [];
    }

    const example = component.exportExamples?.[exportName];

    if (!example) {
      return [];
    }

    return [
      `- **${exportName} example:**`,
      "",
      "```tsx",
      example.code,
      "```",
      "",
    ];
  });
}

export function buildTemplateCatalog(reactPackage, templateExamples) {
  const templates = reactPackage.compositionTemplates;

  if (!Array.isArray(templates)) {
    throw new Error("Missing template metadata export: compositionTemplates");
  }

  const catalog = templates.map((template) => ({
    ...template,
    canonicalExample: templateExamples?.[template.id],
  }));

  assertTemplateIds(catalog);

  if (templateExamples) {
    assertTemplateExampleCoverage(catalog);
  }

  return catalog;
}

function assertTemplateIds(catalog) {
  const seen = new Set();
  const duplicates = [];

  for (const template of catalog) {
    if (seen.has(template.id)) {
      duplicates.push(template.id);
      continue;
    }

    seen.add(template.id);
  }

  if (duplicates.length > 0) {
    throw new Error(
      `Agent template catalog has duplicate template ids: ${[
        ...new Set(duplicates),
      ].join(", ")}`,
    );
  }
}

function assertTemplateExampleCoverage(catalog) {
  const missingExamples = catalog
    .filter((template) => !template.canonicalExample)
    .map((template) => template.id);

  if (missingExamples.length > 0) {
    throw new Error(
      `Agent template catalog is missing canonical examples: ${missingExamples.join(
        ", ",
      )}`,
    );
  }
}

function assertCanonicalExampleCoverage(catalog) {
  const missingExamples = catalog
    .filter((component) => !component.canonicalExample)
    .map((component) => component.name);

  if (missingExamples.length > 0) {
    throw new Error(
      `Agent component catalog is missing canonical examples: ${missingExamples.join(
        ", ",
      )}`,
    );
  }
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
  const { componentCatalog, templateCatalog } = await readBuiltCatalog();
  return renderLlmsTxt(componentCatalog, templateCatalog);
}

export async function generateManifest() {
  const { componentCatalog, templateCatalog } = await readBuiltCatalog();
  const [componentDocs, tokenSources, reactPackage, tokensPackage] =
    await Promise.all([
      readComponentDocs(),
      readTokenSources(),
      readPackageSummary(path.join(repoRoot, "packages/react/package.json")),
      readPackageSummary(path.join(repoRoot, "packages/tokens/package.json")),
    ]);

  return renderManifest({
    componentCatalog,
    templateCatalog,
    componentDocs,
    tokenSources,
    packages: {
      react: reactPackage,
      tokens: tokensPackage,
    },
  });
}

export async function generateConsumerAgentRules() {
  const [reactPackage, tokensPackage, mcpPackage] = await Promise.all([
    readPackageSummary(path.join(repoRoot, "packages/react/package.json")),
    readPackageSummary(path.join(repoRoot, "packages/tokens/package.json")),
    readMcpPackageSummary(path.join(repoRoot, "packages/mcp/package.json")),
  ]);

  return renderConsumerAgentRules({
    packages: {
      react: reactPackage,
      tokens: tokensPackage,
      mcp: mcpPackage,
    },
  });
}

export async function writeAgentSurface() {
  const llmsTxt = await generateLlmsTxt();
  const manifest = stableJson(await generateManifest());
  const manifestSchema = stableJson(renderManifestSchema());
  const consumerAgentRules = await generateConsumerAgentRules();

  await mkdir(consumerAgentRulesDir, { recursive: true });
  await writeFile(llmsTxtPath, llmsTxt, "utf8");
  await writeFile(manifestPath, manifest, "utf8");
  await writeFile(packageManifestPath, manifest, "utf8");
  await writeFile(manifestSchemaPath, manifestSchema, "utf8");
  await writeFile(packageManifestSchemaPath, manifestSchema, "utf8");

  for (const rule of consumerAgentRules) {
    await writeFile(rule.path, rule.content, "utf8");
  }
}

export async function checkAgentSurface() {
  // Only the repo-root copies are committed. The packages/react copies are
  // generated at publish time (`prepack`) and gitignored, so they may not
  // exist on a fresh checkout — don't assert them here.
  await assertFileFresh(llmsTxtPath, await generateLlmsTxt());
  await assertFileFresh(manifestPath, stableJson(await generateManifest()));
  await assertFileFresh(manifestSchemaPath, stableJson(renderManifestSchema()));

  for (const rule of await generateConsumerAgentRules()) {
    await assertFileFresh(rule.path, rule.content);
  }
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

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
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
