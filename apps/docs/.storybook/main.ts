import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    // Hand-written docs pages (intro) are picked up alongside the component
    // stories that live in the @jwrighty/cedar-react package.
    "../src/**/*.mdx",
    "../../../packages/react/src/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
