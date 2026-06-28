import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@jwrighty/cedar-tokens/tokens.css";
import "@jwrighty/cedar-react/styles.css";
import "./styles.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Observe",
  description: "A Cedar-powered observability dashboard for LLM agent runs.",
};

const themeInitializer = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("observe-theme");
    const theme = storedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
