import type { Preview } from "@storybook/react";
import "@jwrighty/cedar-tokens/tokens.css";
import "@jwrighty/cedar-react/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
