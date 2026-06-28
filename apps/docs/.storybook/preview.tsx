import type { Preview } from "@storybook/react";
import "@jwrighty/cedar-tokens/tokens.css";
import "@jwrighty/cedar-react/styles.css";

/**
 * The three Cedar themes, exposed as a Storybook toolbar control. `light` is the
 * default and carries no `[data-theme]` attribute; `dark` and `cedar` opt in.
 * This is the highest-leverage demo (PRD): re-skin every story live without any
 * component or story code changing.
 */
const THEMES = [
  { value: "light", title: "Light", icon: "sun" },
  { value: "dark", title: "Dark", icon: "moon" },
  { value: "cedar", title: "Cedar (brand)", icon: "paintbrush" },
] as const;

const preview: Preview = {
  // Generate an autodocs page for every component story by default.
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      description: "Cedar theme — swaps the [data-theme] attribute live.",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: THEMES.map(({ value, title, icon }) => ({ value, title, icon })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Side-by-side palette stories manage their own per-panel themes, so the
      // global toolbar theme must not wrap (and tint) them. They render on the
      // default light :root and opt each panel into [data-theme] explicitly.
      if (context.parameters.themeCompare) return <Story />;

      const theme = context.globals.theme ?? "light";
      return (
        <div
          data-theme={theme === "light" ? undefined : theme}
          style={{
            background: "var(--semantic-color-surface-page)",
            color: "var(--semantic-color-text-default)",
            padding: "2rem",
            minHeight: "100%",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Introduction", "Components"],
      },
    },
  },
};

export default preview;
