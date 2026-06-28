import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./Dialog";
import { dialogMeta } from "./Dialog.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Dialog",
  component: Dialog.Root,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(dialogMeta) } },
  },
  // Stories supply their own composition via `render`; this satisfies the
  // required `children` arg on Dialog.Root.
  args: { children: null },
} satisfies Meta<typeof Dialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const actions: React.CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
  marginTop: 8,
};

export const Default: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>Delete project…</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Delete project?</Dialog.Title>
        <p style={{ margin: 0, color: "var(--semantic-color-text-muted)" }}>
          This permanently deletes the project and all of its data. This action
          cannot be undone.
        </p>
        <div style={actions}>
          <Dialog.Close>Cancel</Dialog.Close>
          <Dialog.Close variant="primary">Delete</Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>Open terms</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Terms of service</Dialog.Title>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} style={{ margin: 0 }}>
            {i + 1}. The modal scrolls internally and the page behind it stays
            locked while the dialog is open.
          </p>
        ))}
        <div style={actions}>
          <Dialog.Close variant="primary">I agree</Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

/**
 * The same dialog re-themed purely by the `[data-theme]` attribute — no prop or
 * code change. The dialog overlay is portalled to `document.body`, so the theme
 * is re-applied on `Dialog.Content` (via `data-theme`) rather than inherited
 * from the wrapper. In an app where the theme lives on `<html>`/`<body>`, the
 * portal inherits it and this is unnecessary. (Light is the default and needs
 * no attribute.)
 */
export const Themes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["light", "dark", "cedar-light", "cedar-dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme === "light" ? undefined : theme}>
          <Dialog.Root>
            <Dialog.Trigger>{`Open (${theme})`}</Dialog.Trigger>
            <Dialog.Content data-theme={theme === "light" ? undefined : theme}>
              <Dialog.Title>{`${theme} theme`}</Dialog.Title>
              <p
                style={{ margin: 0, color: "var(--semantic-color-text-muted)" }}
              >
                Overlay, panel, and buttons all re-point through the semantic
                tokens for this theme.
              </p>
              <div style={actions}>
                <Dialog.Close>Close</Dialog.Close>
                <Dialog.Close variant="primary">Confirm</Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Root>
        </div>
      ))}
    </div>
  ),
};
