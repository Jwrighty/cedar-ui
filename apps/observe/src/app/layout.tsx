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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
