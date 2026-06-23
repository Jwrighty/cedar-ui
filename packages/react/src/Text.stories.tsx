import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text";
import { textMeta } from "./Text.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Text",
  component: Text,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(textMeta) } },
  },
  args: {
    children: "Cedar typography",
    as: "p",
    size: "md",
    weight: "regular",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["p", "span", "div", "strong", "em", "small"],
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
    },
    weight: {
      control: "inline-radio",
      options: ["regular", "medium", "semibold"],
    },
    tone: {
      control: "inline-radio",
      options: ["default", "muted", "accent", "danger"],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const stack: React.CSSProperties = {
  display: "grid",
  gap: 12,
  minWidth: 360,
};

const sample =
  "Cedar typography stays semantic while the visual treatment follows tokens.";

export const TypeScale: Story = {
  render: (args) => (
    <div style={stack}>
      {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <Text {...args} key={size} size={size}>
          {size}: {sample}
        </Text>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: (args) => (
    <div style={stack}>
      {(["regular", "medium", "semibold"] as const).map((weight) => (
        <Text {...args} key={weight} weight={weight}>
          {weight}: {sample}
        </Text>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div style={stack}>
      {(["default", "muted", "accent", "danger"] as const).map((tone) => (
        <Text {...args} key={tone} tone={tone}>
          {tone}: {sample}
        </Text>
      ))}
    </div>
  ),
};

export const SemanticVsVisual: Story = {
  render: (args) => (
    <div style={stack}>
      <Text {...args} as="span" size="2xl" weight="semibold">
        This is a span rendered at the 2xl visual step.
      </Text>
      <Text {...args} as="p" size="sm" tone="muted">
        This paragraph stays semantically separate from its small visual scale.
      </Text>
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
      {(["light", "dark", "cedar"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={{
            display: "grid",
            gap: 12,
            width: 280,
            padding: 20,
            borderRadius: 12,
            background: "var(--semantic-color-surface-page)",
            border: "1px solid var(--semantic-color-border-default)",
          }}
        >
          <Text {...args} as="span" size="sm" weight="semibold" tone="muted">
            {theme}
          </Text>
          <Text {...args} tone="default">
            The same Text markup uses the current theme foreground.
          </Text>
          <Text {...args} tone="muted">
            Muted copy supports secondary information.
          </Text>
          <Text {...args} tone="accent" weight="medium">
            Accent copy follows the brand theme.
          </Text>
          <Text {...args} tone="danger">
            Danger copy follows semantic error colour.
          </Text>
        </div>
      ))}
    </div>
  ),
};
