import type { TemplateMeta } from "./meta";

/**
 * Render a composition template's {@link TemplateMeta} as Markdown for the
 * Storybook autodocs page. The same typed meta that feeds the manifest,
 * `llms.txt`, and MCP `get_template` drives this description, so the human
 * template gallery cannot drift from the agent surface (ADR-0009).
 *
 * Stories-only: this is imported by `*.stories.tsx`, never by the library
 * entry, so it is not part of the published bundle.
 */
export function templateDocs(template: TemplateMeta): string {
  const bullets = (items: string[]) =>
    items.map((item) => `- ${item}`).join("\n");

  return [
    template.summary,
    `**Status:** \`${template.status}\``,
    `### Use when\n\n${bullets(template.useWhen)}`,
    `### Components\n\n${template.components.join(" · ")}`,
    `### Skeleton\n\n\`\`\`tsx\n${template.skeleton}\n\`\`\``,
  ].join("\n\n");
}
