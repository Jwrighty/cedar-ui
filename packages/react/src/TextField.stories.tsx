import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";
import { textFieldMeta } from "./TextField.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(textFieldMeta) } },
  },
  args: { label: "Email", placeholder: "you@example.com" },
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    label: "Email",
    description: "We'll only use this to send you a receipt.",
  },
};

export const Invalid: Story = {
  args: {
    label: "Email",
    isInvalid: true,
    defaultValue: "not-an-email",
    errorMessage: "Enter a valid email address.",
  },
};

export const Disabled: Story = {
  args: { label: "Email", isDisabled: true, defaultValue: "you@example.com" },
};

const field = { width: 260 } as const;

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
          <TextField
            {...args}
            style={field}
            label="Email"
            description="We'll only use this to send you a receipt."
          />
          <TextField
            {...args}
            style={field}
            label="Email"
            isInvalid
            defaultValue="not-an-email"
            errorMessage="Enter a valid email address."
          />
        </div>
      ))}
    </div>
  ),
};
