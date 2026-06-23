import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "./Box";
import { Inline } from "./Inline";
import { Stack } from "./Stack";
import { stackMeta } from "./Stack.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Layout/Stack",
  component: Stack,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(stackMeta) } },
  },
  args: { gap: "md" },
  argTypes: {
    gap: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Stack>;

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
    <Stack {...args}>
      <div style={item}>First</div>
      <div style={item}>Second</div>
      <div style={item}>Third</div>
    </Stack>
  ),
};

export const Gaps: Story = {
  render: () => (
    <Inline gap="lg">
      {(["none", "sm", "md", "lg"] as const).map((gap) => (
        <Stack key={gap} gap={gap}>
          <strong style={{ color: "var(--semantic-color-text-muted)" }}>
            {gap}
          </strong>
          <div style={item}>One</div>
          <div style={item}>Two</div>
        </Stack>
      ))}
    </Inline>
  ),
};

export const Composition: Story = {
  render: () => (
    <Box padding="lg" style={item}>
      <Stack gap="lg">
        <h2 style={{ margin: 0 }}>Project</h2>
        <p style={{ margin: 0 }}>
          Compose vertical and horizontal flow declaratively.
        </p>
        <Inline gap="sm">
          <button type="button">Save</button>
          <button type="button">Cancel</button>
        </Inline>
      </Stack>
    </Box>
  ),
};

/** The same Stack composition re-skinned only by each theme's data attribute. */
export const Themes: Story = {
  render: () => (
    <Inline gap="md">
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <Box
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          padding="lg"
          style={item}
        >
          <Stack gap="md">
            <strong>{theme}</strong>
            <span>First</span>
            <span>Second</span>
          </Stack>
        </Box>
      ))}
    </Inline>
  ),
};
