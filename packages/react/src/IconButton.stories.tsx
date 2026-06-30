import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";
import { iconButtonMeta } from "./IconButton.meta";
import { usageDocs } from "./usage-docs";

/**
 * Inline 24×24 stroke icons (drawn with `currentColor`) so the stories stay
 * dependency-free. In an app you'd pass a real icon-library glyph as the child.
 */
function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(iconButtonMeta) } },
  },
  args: {
    "aria-label": "Add item",
    variant: "ghost",
    size: "md",
    children: <PlusIcon />,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
    children: { control: false },
  },
} satisfies Meta<typeof IconButton>;

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
      <IconButton {...args} variant="primary" aria-label="Add item">
        <PlusIcon />
      </IconButton>
      <IconButton {...args} variant="secondary" aria-label="Add item">
        <PlusIcon />
      </IconButton>
      <IconButton {...args} variant="ghost" aria-label="Add item">
        <PlusIcon />
      </IconButton>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <IconButton {...args} size="sm" aria-label="Close">
        <CloseIcon />
      </IconButton>
      <IconButton {...args} size="md" aria-label="Close">
        <CloseIcon />
      </IconButton>
      <IconButton {...args} size="lg" aria-label="Close">
        <CloseIcon />
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div style={row}>
      <IconButton {...args} variant="primary" aria-label="Add item">
        <PlusIcon />
      </IconButton>
      <IconButton {...args} variant="secondary" aria-label="Add item">
        <PlusIcon />
      </IconButton>
      <IconButton {...args} variant="ghost" aria-label="Add item">
        <PlusIcon />
      </IconButton>
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
            <IconButton {...args} variant="primary" aria-label="Add item">
              <PlusIcon />
            </IconButton>
            <IconButton {...args} variant="secondary" aria-label="Add item">
              <PlusIcon />
            </IconButton>
            <IconButton {...args} variant="ghost" aria-label="Add item">
              <PlusIcon />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  ),
};
