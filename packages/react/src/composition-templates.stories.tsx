import type { Meta, StoryObj } from "@storybook/react";
import {
  AsyncStatePanelTemplateExample,
  asyncStatePanelTemplate,
  FilterableTableTemplateExample,
  filterableTableTemplate,
  FormDialogTemplateExample,
  formDialogTemplate,
  SettingsPageTemplateExample,
  settingsPageTemplate,
} from "./composition-templates";
import type { TemplateMeta } from "./meta";
import { templateDocs } from "./template-docs";

/**
 * One story per shipped composition template (ADR-0009), grouped apart from
 * the per-component stories above. Each story renders the exact tested
 * example function that also backs the generated manifest, `llms.txt`, and
 * the MCP `get_template` tool — so this page cannot drift from what an agent
 * sees. Adding a template here is one `templateStory(...)` export pointing at
 * its existing meta and example function; no other wiring is bespoke to
 * Storybook.
 */
const meta = {
  title: "Templates",
  parameters: {
    docs: {
      description: {
        component:
          "Common multi-component compositions agents assemble wrong at the page level. Each story is the same tested example function used by `cedar.manifest.json`, `llms.txt`, and the MCP `get_template` tool.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function templateStory(
  template: TemplateMeta,
  Example: React.ComponentType,
): Story {
  return {
    name: template.id,
    parameters: { docs: { description: { story: templateDocs(template) } } },
    render: () => <Example />,
  };
}

export const FormDialog: Story = templateStory(
  formDialogTemplate,
  FormDialogTemplateExample,
);

export const FilterableTable: Story = templateStory(
  filterableTableTemplate,
  FilterableTableTemplateExample,
);

export const SettingsPage: Story = templateStory(
  settingsPageTemplate,
  SettingsPageTemplateExample,
);

export const AsyncStatePanel: Story = templateStory(
  asyncStatePanelTemplate,
  AsyncStatePanelTemplateExample,
);
