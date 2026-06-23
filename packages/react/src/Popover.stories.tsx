import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { Button } from "./Button";
import { Popover } from "./Popover";
import { popoverMeta } from "./Popover.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Popover",
  component: Popover.Root,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(popoverMeta) } },
  },
  args: { children: null },
} satisfies Meta<typeof Popover.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = {
  display: "grid",
  gap: 12,
  minInlineSize: 180,
} satisfies CSSProperties;

const paragraph = {
  margin: 0,
  color: "var(--semantic-color-text-muted)",
} satisfies CSSProperties;

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>Project details</Popover.Trigger>
      <Popover.Content>
        <div style={content}>
          <strong>Design system</strong>
          <p style={paragraph}>Updated a few seconds ago.</p>
          <Button size="sm" variant="secondary">
            Open project
          </Button>
        </div>
      </Popover.Content>
    </Popover.Root>
  ),
};

/** All recipe variants, posed open for visual regression. */
export const Sizes: Story = {
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    chromatic: { pauseAnimationAtEnd: true },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 160,
        padding: 80,
      }}
    >
      {(["sm", "md", "lg"] as const).map((size) => (
        <Popover.Root key={size} isOpen>
          <Popover.Trigger variant="secondary">{size}</Popover.Trigger>
          <Popover.Content
            size={size}
            placement="bottom"
            shouldFlip={false}
            isNonModal
          >
            <div style={content}>
              <strong>{size} surface</strong>
              <p style={paragraph}>
                The content stays anchored to its trigger.
              </p>
            </div>
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  ),
};

/** RAC placements, posed open so Chromatic captures every anchor direction. */
export const Placements: Story = {
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    chromatic: { pauseAnimationAtEnd: true },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        placeItems: "center",
        gap: 180,
        minHeight: 640,
        padding: 120,
      }}
    >
      {(["top", "right", "bottom", "left"] as const).map((placement) => (
        <Popover.Root key={placement} isOpen>
          <Popover.Trigger variant="secondary">{placement}</Popover.Trigger>
          <Popover.Content placement={placement} shouldFlip={false} isNonModal>
            <strong>{placement} placement</strong>
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  ),
};

/**
 * Identical Popover markup re-themed only through `[data-theme]`. Because the
 * surfaces are portalled, the theme attribute is applied to Content directly.
 */
export const Themes: Story = {
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    chromatic: { pauseAnimationAtEnd: true },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        gap: 160,
        minHeight: 420,
        padding: 100,
        background: "var(--semantic-color-surface-page)",
      }}
    >
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <div key={theme} data-theme={theme === "light" ? undefined : theme}>
          <Popover.Root isOpen>
            <Popover.Trigger variant="secondary">{theme}</Popover.Trigger>
            <Popover.Content
              isNonModal
              placement="bottom"
              shouldFlip={false}
              data-theme={theme === "light" ? undefined : theme}
            >
              <div style={content}>
                <strong>{theme} theme</strong>
                <p style={paragraph}>Same component, different semantic map.</p>
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
      ))}
    </div>
  ),
};
