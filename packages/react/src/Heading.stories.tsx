import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./Heading";
import { headingMeta } from "./Heading.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Heading",
  component: Heading,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(headingMeta) } },
  },
  args: {
    children: "Cedar heading",
    level: 2,
    size: "xl",
    weight: "semibold",
  },
  argTypes: {
    level: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
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
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const stack: React.CSSProperties = {
  display: "grid",
  gap: 12,
  minWidth: 360,
};

export const Levels: Story = {
  render: (args) => (
    <div style={stack}>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Heading {...args} key={level} level={level}>
          h{level}: Logical document level
        </Heading>
      ))}
    </div>
  ),
};

export const TypeScale: Story = {
  render: (args) => (
    <div style={stack}>
      {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <Heading {...args} key={size} size={size}>
          {size}: Visual scale step
        </Heading>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: (args) => (
    <div style={stack}>
      {(["regular", "medium", "semibold"] as const).map((weight) => (
        <Heading {...args} key={weight} weight={weight}>
          {weight}: Heading weight
        </Heading>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div style={stack}>
      {(["default", "muted", "accent", "danger"] as const).map((tone) => (
        <Heading {...args} key={tone} tone={tone}>
          {tone}: Heading tone
        </Heading>
      ))}
    </div>
  ),
};

export const SemanticVsVisual: Story = {
  render: (args) => (
    <div style={stack}>
      <Heading {...args} level={2} size="sm">
        This is an h2 rendered at the sm visual step.
      </Heading>
      <Heading {...args} level={3} size="2xl">
        This is an h3 rendered at the 2xl visual step.
      </Heading>
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
        <section
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
          <Heading {...args} level={2} size="lg" tone="default">
            {theme} heading
          </Heading>
          <Heading {...args} level={3} size="md" tone="muted">
            Muted subheading
          </Heading>
          <Heading {...args} level={3} size="md" tone="accent">
            Brand-accented subheading
          </Heading>
          <Heading {...args} level={3} size="md" tone="danger">
            Danger subheading
          </Heading>
        </section>
      ))}
    </div>
  ),
};
