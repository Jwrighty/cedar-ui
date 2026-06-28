import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { tooltipMeta } from "./Tooltip.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(tooltipMeta) } },
  },
  args: { children: "Save your changes", placement: "top" },
  argTypes: {
    placement: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip.Trigger>
      <Button>Save</Button>
      <Tooltip {...args} />
    </Tooltip.Trigger>
  ),
};

export const IconButton: Story = {
  render: (args) => (
    <Tooltip.Trigger>
      <Button aria-label="Delete notification" variant="ghost">
        <span aria-hidden="true">×</span>
      </Button>
      <Tooltip {...args}>Delete notification</Tooltip>
    </Tooltip.Trigger>
  ),
};

/** Posed open so Chromatic captures the portalled overlay deterministically. */
export const PosedOpen: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <Tooltip.Trigger isOpen>
      <Button>Save</Button>
      <Tooltip {...args} />
    </Tooltip.Trigger>
  ),
};

/** Every placement recipe variant, posed open for visual regression coverage. */
export const Placements: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(160px, 1fr))",
        gap: 96,
        padding: 80,
      }}
    >
      {(["top", "right", "bottom", "left"] as const).map((placement) => (
        <Tooltip.Trigger key={placement} isOpen>
          <Button variant="secondary">{placement}</Button>
          <Tooltip {...args} placement={placement}>
            {`${placement} placement`}
          </Tooltip>
        </Tooltip.Trigger>
      ))}
    </div>
  ),
};

/**
 * Identical component markup re-themed through `[data-theme]`. Because each
 * tooltip is portalled to `document.body`, the theme attribute is repeated on
 * the overlay; apps that theme `<html>` or `<body>` inherit it automatically.
 */
export const Themes: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <div style={{ display: "flex", gap: 112, padding: 80 }}>
      {(["light", "dark", "cedar-light", "cedar-dark"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={{
            padding: 20,
            borderRadius: 12,
            background: "var(--semantic-color-surface-page)",
            border: "1px solid var(--semantic-color-border-default)",
          }}
        >
          <Tooltip.Trigger isOpen>
            <Button variant="secondary">{theme}</Button>
            <Tooltip
              {...args}
              data-theme={theme === "light" ? undefined : theme}
            />
          </Tooltip.Trigger>
        </div>
      ))}
    </div>
  ),
};
