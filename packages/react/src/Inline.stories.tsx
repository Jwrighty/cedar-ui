import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "./Box";
import { Inline } from "./Inline";
import { inlineMeta } from "./Inline.meta";
import { Stack } from "./Stack";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Layout/Inline",
  component: Inline,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(inlineMeta) } },
  },
  args: { gap: "md" },
  argTypes: {
    gap: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

const item: CSSProperties = {
  padding: "var(--semantic-space-inset-sm)",
  color: "var(--semantic-color-text-default)",
  background: "var(--semantic-color-surface-raised)",
  border:
    "var(--semantic-border-width) solid var(--semantic-color-border-default)",
  borderRadius: "var(--semantic-radius-control)",
};

export const Playground: Story = {
  render: (args) => (
    <Inline {...args}>
      <span style={item}>First</span>
      <span style={item}>Second</span>
      <span style={item}>Third</span>
    </Inline>
  ),
};

export const Gaps: Story = {
  render: () => (
    <Stack gap="lg">
      {(["none", "sm", "md", "lg"] as const).map((gap) => (
        <Inline key={gap} gap={gap}>
          <strong style={{ color: "var(--semantic-color-text-muted)" }}>
            {gap}
          </strong>
          <span style={item}>One</span>
          <span style={item}>Two</span>
        </Inline>
      ))}
    </Stack>
  ),
};

export const Composition: Story = {
  render: () => (
    <Box padding="lg" style={item}>
      <Stack gap="md">
        <strong>Actions</strong>
        <Inline as="nav" aria-label="Project actions" gap="sm">
          <a href="#edit">Edit</a>
          <a href="#duplicate">Duplicate</a>
          <a href="#archive">Archive</a>
        </Inline>
      </Stack>
    </Box>
  ),
};

/** The same Inline composition re-skinned only by each theme's data attribute. */
export const Themes: Story = {
  render: () => (
    <Inline gap="md">
      {(["light", "dark", "cedar-light", "cedar-dark"] as const).map((theme) => (
        <Box
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          padding="lg"
          style={item}
        >
          <Inline gap="sm">
            <strong>{theme}</strong>
            <span>One</span>
            <span>Two</span>
          </Inline>
        </Box>
      ))}
    </Inline>
  ),
};
