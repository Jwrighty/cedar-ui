import type { ComponentMeta } from "./meta";

/**
 * Render a component's {@link ComponentMeta} as Markdown for the Storybook
 * autodocs page (`parameters.docs.description.component`). The same typed meta
 * that feeds the machine-readable agent surface (ADR-0009) drives the human
 * docs, so the two cannot drift apart.
 *
 * Stories-only: this is imported by `*.stories.tsx`, never by the library
 * entry, so it is not part of the published bundle.
 */
export function usageDocs(meta: ComponentMeta): string {
  const bullets = (items: string[]) =>
    items.map((item) => `- ${item}`).join("\n");

  const sections = [
    meta.summary,
    `**Status:** \`${meta.status}\``,
    `### Use when\n\n${bullets(meta.useWhen)}`,
    `### Avoid when\n\n${meta.avoidWhen
      .map((a) => `- ${a.situation} — use **${a.useInstead}** instead.`)
      .join("\n")}`,
    `### Accessibility\n\n${bullets(meta.a11yNotes)}`,
  ];

  if (meta.relatedComponents.length > 0) {
    sections.push(`### Related\n\n${meta.relatedComponents.join(" · ")}`);
  }

  return sections.join("\n\n");
}
