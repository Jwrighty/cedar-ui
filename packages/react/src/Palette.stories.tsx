import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Foundational palette reference. Renders the default `light` and `dark` themes
 * side by side so the off-white/teal identity and its WCAG-AA status + chart
 * colours can be compared at a glance. Every swatch resolves through a semantic
 * token — there are no hardcoded hexes here — so this page tracks the tokens
 * automatically. The `themeCompare` parameter tells the global decorator to step
 * aside so each panel can own its `[data-theme]`.
 */
const meta = {
  title: "Tokens/Palette",
  parameters: {
    layout: "fullscreen",
    themeCompare: true,
    docs: {
      description: {
        component:
          "Default light and dark themes shown side by side. All swatches are " +
          "driven by `--semantic-color-*` tokens from `@jwrighty/cedar-tokens`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Swatch = { label: string; varName: string };

const SURFACES: Swatch[] = [
  { label: "page", varName: "--semantic-color-surface-page" },
  { label: "raised", varName: "--semantic-color-surface-raised" },
  { label: "sunken", varName: "--semantic-color-surface-sunken" },
  { label: "border", varName: "--semantic-color-border-default" },
];

const TEXT: Swatch[] = [
  { label: "default", varName: "--semantic-color-text-default" },
  { label: "muted", varName: "--semantic-color-text-muted" },
  { label: "accent", varName: "--semantic-color-text-accent" },
  { label: "danger", varName: "--semantic-color-text-danger" },
];

const ACTION: Swatch[] = [
  { label: "rest", varName: "--semantic-color-action-rest" },
  { label: "hover", varName: "--semantic-color-action-hover" },
  { label: "active", varName: "--semantic-color-action-active" },
  { label: "subtle", varName: "--semantic-color-action-subtle" },
];

const CHART: Swatch[] = [
  { label: "1", varName: "--semantic-color-chart-categorical-one" },
  { label: "2", varName: "--semantic-color-chart-categorical-two" },
  { label: "3", varName: "--semantic-color-chart-categorical-three" },
  { label: "4", varName: "--semantic-color-chart-categorical-four" },
  { label: "5", varName: "--semantic-color-chart-categorical-five" },
  { label: "6", varName: "--semantic-color-chart-categorical-six" },
];

const STATUSES = ["running", "success", "error"] as const;

const groupLabel: CSSProperties = {
  fontFamily: "var(--semantic-font-body-family)",
  fontSize: "var(--semantic-font-label-size)",
  fontWeight: "var(--semantic-font-label-weight)",
  color: "var(--semantic-color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  margin: "0 0 var(--semantic-space-stack-sm)",
};

function ChipRow({ items }: { items: Swatch[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--semantic-space-gap-md)" }}>
      {items.map(({ label, varName }) => (
        <div key={varName} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "var(--semantic-radius-control)",
              background: `var(${varName})`,
              border:
                "var(--semantic-border-width) solid var(--semantic-color-border-default)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--semantic-font-body-family)",
              fontSize: "var(--semantic-font-size-xs)",
              color: "var(--semantic-color-text-muted)",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusPills() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--semantic-space-gap-md)" }}>
      {STATUSES.map((status) => (
        <span
          key={status}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.125rem 0.625rem",
            borderRadius: "999px",
            fontFamily: "var(--semantic-font-body-family)",
            fontSize: "var(--semantic-font-label-size)",
            fontWeight: "var(--semantic-font-label-weight)",
            color: `var(--semantic-color-status-${status}-foreground)`,
            background: `var(--semantic-color-status-${status}-surface)`,
            border: `var(--semantic-border-width) solid var(--semantic-color-status-${status}-border)`,
          }}
        >
          {status}
        </span>
      ))}
    </div>
  );
}

function Panel({ title, theme }: { title: string; theme?: "dark" }) {
  return (
    <div
      data-theme={theme}
      style={{
        flex: "1 1 0",
        minWidth: "18rem",
        padding: "var(--semantic-space-inset-lg)",
        background: "var(--semantic-color-surface-page)",
        color: "var(--semantic-color-text-default)",
      }}
    >
      <h2
        style={{
          margin: "0 0 var(--semantic-space-stack-lg)",
          fontFamily: "var(--semantic-font-body-family)",
          fontSize: "var(--semantic-font-size-lg)",
          fontWeight: "var(--semantic-font-weight-semibold)",
        }}
      >
        {title}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--semantic-space-stack-lg)" }}>
        <section>
          <p style={groupLabel}>Surfaces</p>
          <ChipRow items={SURFACES} />
        </section>
        <section>
          <p style={groupLabel}>Text</p>
          <ChipRow items={TEXT} />
        </section>
        <section>
          <p style={groupLabel}>Action (teal accent)</p>
          <ChipRow items={ACTION} />
        </section>
        <section>
          <p style={groupLabel}>Status</p>
          <StatusPills />
        </section>
        <section>
          <p style={groupLabel}>Chart categorical</p>
          <ChipRow items={CHART} />
        </section>
      </div>
    </div>
  );
}

export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100vh" }}>
      <Panel title="Light (default)" />
      <Panel title="Dark" theme="dark" />
    </div>
  ),
};
