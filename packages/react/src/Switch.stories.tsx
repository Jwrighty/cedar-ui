import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";
import { switchMeta } from "./Switch.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(switchMeta) } },
  },
  args: { children: "Enable notifications", size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    isSelected: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Off: Story = {};

export const On: Story = {
  args: { defaultSelected: true },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Switch {...args} isDisabled>
        Disabled off
      </Switch>
      <Switch {...args} isDisabled defaultSelected>
        Disabled on
      </Switch>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Switch {...args} size="sm">
        Small
      </Switch>
      <Switch {...args} size="md" defaultSelected>
        Medium
      </Switch>
      <Switch {...args} size="lg">
        Large
      </Switch>
    </div>
  ),
};

/**
 * Identical Switch markup re-themed only by `[data-theme]`, proving that light,
 * dark, and Cedar brand appearances require no component-code changes.
 */
export const Themes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={{
            display: "grid",
            gap: 12,
            padding: 20,
            borderRadius: 12,
            background: "var(--semantic-color-surface-page)",
            border: "1px solid var(--semantic-color-border-default)",
          }}
        >
          <strong style={{ color: "var(--semantic-color-text-muted)" }}>
            {theme}
          </strong>
          <Switch {...args}>Off</Switch>
          <Switch {...args} defaultSelected>
            On
          </Switch>
          <Switch {...args} isDisabled defaultSelected>
            Disabled
          </Switch>
        </div>
      ))}
    </div>
  ),
};
