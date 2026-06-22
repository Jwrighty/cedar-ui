import type { ReactNode } from "react";
import "@cedar-ui/tokens/tokens.css";
import "@cedar-ui/react/styles.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
