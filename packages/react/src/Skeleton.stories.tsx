import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";
import { skeletonMeta } from "./Skeleton.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(skeletonMeta) } },
  },
  args: { shape: "rounded", style: { width: 280, height: 96 } },
  argTypes: {
    shape: {
      control: "inline-radio",
      options: ["rectangle", "rounded", "circle", "text"],
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Shapes: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 96px)",
        gap: "var(--semantic-space-gap-md)",
        alignItems: "center",
      }}
    >
      <Skeleton shape="rectangle" style={{ width: 96, height: 64 }} />
      <Skeleton shape="rounded" style={{ width: 96, height: 64 }} />
      <Skeleton shape="circle" style={{ width: 64, height: 64 }} />
      <Skeleton shape="text" style={{ width: 96 }} />
    </div>
  ),
};

export const MetricLoading: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Skeleton
        shape="rounded"
        style={{
          width: 96,
          height: 20,
          marginBlockEnd: "var(--semantic-space-stack-md)",
        }}
      />
      <Skeleton shape="rounded" style={{ width: 172, height: 36 }} />
      <Skeleton
        shape="rounded"
        style={{
          height: 48,
          marginBlockStart: "var(--semantic-space-stack-md)",
        }}
      />
    </div>
  ),
};
