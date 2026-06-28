import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";
import { cardMeta } from "./Card.meta";
import { Text } from "./Text";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Surfaces/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(cardMeta) } },
  },
  args: { padding: "none" },
  argTypes: {
    padding: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Slots: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 320 }}>
      <CardHeader>
        <Text as="strong" weight="semibold">
          Run summary
        </Text>
      </CardHeader>
      <CardBody>
        <Text tone="muted">Latest agent run completed in 842ms.</Text>
      </CardBody>
      <CardFooter>
        <Text as="small" size="sm" tone="muted">
          Updated just now
        </Text>
      </CardFooter>
    </Card>
  ),
};

export const SimplePanel: Story = {
  args: {
    padding: "lg",
    children: "A compact framed panel using direct Card children.",
    style: { width: 280 },
  },
};

export const Themes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--semantic-space-gap-md)" }}>
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={{
            background: "var(--semantic-color-surface-page)",
            color: "var(--semantic-color-text-default)",
            padding: "var(--semantic-space-inset-md)",
          }}
        >
          <Card padding="lg" style={{ width: 180 }}>
            <Text weight="semibold">{theme}</Text>
          </Card>
        </div>
      ))}
    </div>
  ),
};
