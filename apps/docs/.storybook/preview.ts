import type { Preview } from "@storybook/react";
import "@cedar-ui/tokens/tokens.css";
import "@cedar-ui/react/styles.css";

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
