import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "./Box";
import { boxMeta } from "./Box.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Layout/Box",
  component: Box,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(boxMeta) } },
  },
  args: { children: "Box content", padding: "md" },
  argTypes: {
    padding: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

const surface: CSSProperties = {
  color: "var(--semantic-color-text-default)",
  background: "var(--semantic-color-surface-raised)",
  border:
    "var(--semantic-border-width) solid var(--semantic-color-border-default)",
  borderRadius: "var(--semantic-radius-control)",
};

export const Playground: Story = {
  render: (args) => <Box {...args} style={surface} />,
};

export const Padding: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--semantic-space-gap-md)",
      }}
    >
      {(["none", "sm", "md", "lg"] as const).map((padding) => (
        <Box key={padding} padding={padding} style={surface}>
          {padding}
        </Box>
      ))}
    </div>
  ),
};

/** The same Box markup re-skinned only by each theme's data attribute. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--semantic-space-gap-md)" }}>
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <Box
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          padding="lg"
          style={surface}
        >
          {theme}
        </Box>
      ))}
    </div>
  ),
};
