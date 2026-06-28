import type { Meta, StoryObj } from "@storybook/react";
import { Radio, RadioGroup } from "./RadioGroup";
import { radioGroupMeta } from "./RadioGroup.meta";
import { usageDocs } from "./usage-docs";

const options = (
  <>
    <Radio value="email">Email</Radio>
    <Radio value="sms">SMS</Radio>
    <Radio value="push">Push notification</Radio>
  </>
);

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(radioGroupMeta) } },
  },
  args: {
    label: "Preferred notification channel",
    defaultValue: "email",
    children: options,
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    description: "We will use this channel for account notifications.",
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: undefined,
    isInvalid: true,
    errorMessage: "Choose a notification channel.",
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
};

export const DisabledOption: Story = {
  args: {
    children: (
      <>
        <Radio value="email">Email</Radio>
        <Radio value="sms" isDisabled>
          SMS (unavailable)
        </Radio>
        <Radio value="push">Push notification</Radio>
      </>
    ),
  },
};

export const Orientations: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 24 }}>
      <RadioGroup {...args} label="Vertical" orientation="vertical">
        {options}
      </RadioGroup>
      <RadioGroup {...args} label="Horizontal" orientation="horizontal">
        {options}
      </RadioGroup>
    </div>
  ),
};

/**
 * Identical component markup re-themed only by `[data-theme]` (light, dark,
 * and Cedar brand), proving that the theme seam requires no component change.
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
            gap: 12,
            minWidth: 240,
            padding: 20,
            borderRadius: 12,
            background: "var(--semantic-color-surface-page)",
            border: "1px solid var(--semantic-color-border-default)",
          }}
        >
          <strong style={{ color: "var(--semantic-color-text-muted)" }}>
            {theme}
          </strong>
          <RadioGroup
            {...args}
            label="Preferred channel"
            description="Choose one option."
          >
            {options}
          </RadioGroup>
          <RadioGroup
            {...args}
            label="Invalid example"
            defaultValue={undefined}
            isInvalid
            errorMessage="Choose an option."
          >
            {options}
          </RadioGroup>
        </div>
      ))}
    </div>
  ),
};
