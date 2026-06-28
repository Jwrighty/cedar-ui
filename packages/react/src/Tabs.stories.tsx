import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";
import { tabsMeta } from "./Tabs.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Tabs",
  component: Tabs.Root,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(tabsMeta) } },
  },
  // Stories supply their own composition via `render`; this satisfies the
  // required `children` arg on Tabs.Root.
  args: { children: null },
} satisfies Meta<typeof Tabs.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const frame: React.CSSProperties = {
  width: 520,
  maxWidth: "80vw",
  padding: 20,
  borderRadius: 12,
  background: "var(--semantic-color-surface-page)",
  border: "1px solid var(--semantic-color-border-default)",
};

const panelCopy: React.CSSProperties = {
  margin: 0,
  color: "var(--semantic-color-text-muted)",
};

const ProjectTabs = () => (
  <Tabs.Root defaultSelectedKey="overview">
    <Tabs.List aria-label="Project sections">
      <Tabs.Tab id="overview">Overview</Tabs.Tab>
      <Tabs.Tab id="activity">Activity</Tabs.Tab>
      <Tabs.Tab id="settings">Settings</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel id="overview">
      <p style={panelCopy}>
        Overview keeps the high-level project health and ownership in view.
      </p>
    </Tabs.Panel>
    <Tabs.Panel id="activity">
      <p style={panelCopy}>
        Activity shows recent changes, comments, and deployment events.
      </p>
    </Tabs.Panel>
    <Tabs.Panel id="settings">
      <p style={panelCopy}>
        Settings groups project permissions, notifications, and defaults.
      </p>
    </Tabs.Panel>
  </Tabs.Root>
);

export const Default: Story = {
  render: () => (
    <div style={frame}>
      <ProjectTabs />
    </div>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <div style={frame}>
      <Tabs.Root defaultSelectedKey="summary">
        <Tabs.List aria-label="Account sections">
          <Tabs.Tab id="summary">Summary</Tabs.Tab>
          <Tabs.Tab id="members">Members</Tabs.Tab>
          <Tabs.Tab id="billing">Billing</Tabs.Tab>
          <Tabs.Tab id="security">Security</Tabs.Tab>
          <Tabs.Tab id="integrations">Integrations</Tabs.Tab>
          <Tabs.Tab id="audit-log">Audit log</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="summary">
          <p style={panelCopy}>Summary content for the account workspace.</p>
        </Tabs.Panel>
        <Tabs.Panel id="members">
          <p style={panelCopy}>Members content for account collaborators.</p>
        </Tabs.Panel>
        <Tabs.Panel id="billing">
          <p style={panelCopy}>Billing content for invoices and plans.</p>
        </Tabs.Panel>
        <Tabs.Panel id="security">
          <p style={panelCopy}>Security content for authentication controls.</p>
        </Tabs.Panel>
        <Tabs.Panel id="integrations">
          <p style={panelCopy}>Integrations content for connected services.</p>
        </Tabs.Panel>
        <Tabs.Panel id="audit-log">
          <p style={panelCopy}>Audit log content for recent account events.</p>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <div style={frame}>
      <Tabs.Root defaultSelectedKey="overview">
        <Tabs.List aria-label="Plan sections">
          <Tabs.Tab id="overview">Overview</Tabs.Tab>
          <Tabs.Tab id="usage">Usage</Tabs.Tab>
          <Tabs.Tab id="billing" isDisabled>
            Billing
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="overview">
          <p style={panelCopy}>Plan overview remains available to everyone.</p>
        </Tabs.Panel>
        <Tabs.Panel id="usage">
          <p style={panelCopy}>Usage is available for active workspaces.</p>
        </Tabs.Panel>
        <Tabs.Panel id="billing">
          <p style={panelCopy}>
            Billing is disabled until payments are configured.
          </p>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  ),
};

/**
 * The same markup re-themed purely by the `[data-theme]` attribute — no prop or
 * component code change. Proves the token seam end to end.
 */
export const Themes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["light", "dark", "cedar-light", "cedar-dark"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme === "light" ? undefined : theme}
          style={frame}
        >
          <strong style={{ color: "var(--semantic-color-text-muted)" }}>
            {theme}
          </strong>
          <ProjectTabs />
        </div>
      ))}
    </div>
  ),
};
