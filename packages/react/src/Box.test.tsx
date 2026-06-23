import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Box } from "./Box";
import { Inline } from "./Inline";
import { Stack } from "./Stack";

describe("Box", () => {
  it("renders as the requested element with token-backed padding", () => {
    render(
      <Box as="section" aria-label="Account" padding="lg">
        Settings
      </Box>,
    );

    const box = screen.getByRole("region", { name: "Account" });
    expect(box).toHaveTextContent("Settings");
    expect(box).toHaveAttribute("data-padding", "lg");
  });

  it("forwards its ref, className, style, and native props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Box
        ref={ref}
        as="article"
        aria-label="News"
        className="consumer-class"
        style={{ maxWidth: 480 }}
      />,
    );

    const article = screen.getByRole("article", { name: "News" });
    expect(ref.current).toBe(article);
    expect(article).toHaveClass("consumer-class");
    expect(article).toHaveStyle({ maxWidth: "480px" });
  });

  it("has no axe violations in a representative layout composition", async () => {
    const { container } = render(
      <Box as="main" padding="lg">
        <Stack as="section" aria-label="Actions" gap="md">
          <h2>Actions</h2>
          <Inline gap="sm">
            <a href="/save">Save</a>
            <a href="/cancel">Cancel</a>
          </Inline>
        </Stack>
      </Box>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
