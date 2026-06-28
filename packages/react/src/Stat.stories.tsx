import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";
import { Stat } from "./Stat";
import { statMeta } from "./Stat.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Data Display/Stat",
  component: Stat,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(statMeta) } },
  },
  args: {
    label: "Runs",
    value: "1,248",
    delta: { direction: "positive", value: "+8%" },
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

const sparkline = (
  <svg role="img" aria-label="Runs trend" viewBox="0 0 160 40" width="100%">
    <polyline
      points="0,28 24,26 48,30 72,20 96,24 120,12 160,16"
      fill="none"
      stroke="var(--semantic-color-chart-categorical-one)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Playground: Story = {
  args: { visual: sparkline, style: { width: 280 } },
};

export const Directions: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--semantic-space-gap-md)" }}>
      <Stat
        style={{ width: 240 }}
        label="Success rate"
        value="98.2%"
        delta={{ direction: "positive", value: "+2.1%" }}
      />
      <Stat
        style={{ width: 240 }}
        label="P95 latency"
        value="842ms"
        delta={{ direction: "negative", value: "+124ms" }}
      />
      <Stat
        style={{ width: 240 }}
        label="Total cost"
        value="$42.10"
        delta={{ direction: "neutral", value: "flat" }}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <Stat
      style={{ width: 280 }}
      label={<Skeleton shape="rounded" style={{ width: 96, height: 20 }} />}
      value={<Skeleton shape="rounded" style={{ width: 160, height: 36 }} />}
      visual={<Skeleton shape="rounded" style={{ height: 40 }} />}
    />
  ),
};
