import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { buttonMeta } from "./Button.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(buttonMeta) } },
  },
  args: { children: "Button", variant: "primary", size: "md" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const row: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

/**
 * The same markup re-themed purely by the `[data-theme]` attribute — no prop or
 * code change. Proves the token seam end to end (light → dark → cedar brand).
 */
export const Themes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["light", "dark", "cedar-light", "cedar-dark"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={{
            display: "grid",
            gap: 8,
            padding: 20,
            borderRadius: 12,
            background: "var(--semantic-color-surface-page)",
            border: "1px solid var(--semantic-color-border-default)",
          }}
        >
          <strong style={{ color: "var(--semantic-color-text-muted)" }}>
            {theme}
          </strong>
          <div style={row}>
            <Button {...args} variant="primary">
              Primary
            </Button>
            <Button {...args} variant="secondary">
              Secondary
            </Button>
            <Button {...args} variant="ghost">
              Ghost
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};
