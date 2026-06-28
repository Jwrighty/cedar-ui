import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";
import { badgeMeta } from "./Badge.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Data Display/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(badgeMeta) } },
  },
  args: { children: "Running", status: "running", size: "md" },
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["neutral", "running", "success", "error"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--semantic-space-gap-sm)" }}>
      <Badge>Queued</Badge>
      <Badge status="running">Running</Badge>
      <Badge status="success">Success</Badge>
      <Badge status="error">Error</Badge>
    </div>
  ),
};

export const Themes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--semantic-space-gap-md)" }}>
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={{
            display: "flex",
            gap: "var(--semantic-space-gap-sm)",
            padding: "var(--semantic-space-inset-md)",
            background: "var(--semantic-color-surface-page)",
          }}
        >
          <Badge status="running">Running</Badge>
          <Badge status="success">Success</Badge>
          <Badge status="error">Error</Badge>
        </div>
      ))}
    </div>
  ),
};
