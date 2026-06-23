import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { checkboxMeta } from "./Checkbox.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(checkboxMeta) } },
  },
  args: { children: "Accept terms" },
  argTypes: {
    isSelected: { control: "boolean" },
    defaultSelected: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const column: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

export const States: Story = {
  render: () => (
    <div style={column}>
      <Checkbox>Unselected</Checkbox>
      <Checkbox defaultSelected>Selected</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
      <Checkbox isDisabled defaultSelected>
        Disabled selected
      </Checkbox>
      <Checkbox isInvalid>Invalid</Checkbox>
    </div>
  ),
};

/**
 * Identical Checkbox markup re-themed solely by each container's
 * `[data-theme]` attribute (light → dark → Cedar brand).
 */
export const Themes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={{
            ...column,
            padding: 20,
            borderRadius: 12,
            background: "var(--semantic-color-surface-page)",
            border: "1px solid var(--semantic-color-border-default)",
          }}
        >
          <strong style={{ color: "var(--semantic-color-text-muted)" }}>
            {theme}
          </strong>
          <Checkbox>Unselected</Checkbox>
          <Checkbox defaultSelected>Selected</Checkbox>
          <Checkbox isIndeterminate>Indeterminate</Checkbox>
          <Checkbox isInvalid>Invalid</Checkbox>
        </div>
      ))}
    </div>
  ),
};
