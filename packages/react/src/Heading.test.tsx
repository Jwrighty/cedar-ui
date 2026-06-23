import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Heading } from "./Heading";

describe("Heading", () => {
  it("keeps document outline level independent from visual size", () => {
    render(
      <Heading level={2} size="sm">
        Billing details
      </Heading>,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Billing details",
    });

    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveAttribute("data-size", "sm");
  });

  it("forwards refs and passes consumer className/style through", () => {
    const ref = createRef<HTMLHeadingElement>();

    render(
      <Heading
        ref={ref}
        level={3}
        className="consumer-heading"
        style={{ textAlign: "center" }}
      >
        Shipping address
      </Heading>,
    );

    expect(ref.current).toBe(
      screen.getByRole("heading", { level: 3, name: "Shipping address" }),
    );
    expect(ref.current).toHaveClass("consumer-heading");
    expect(ref.current).toHaveStyle({ textAlign: "center" });
  });

  it("has no axe violations across variants", async () => {
    const { container } = render(
      <>
        <Heading level={1} size="2xl" weight="semibold" tone="default">
          Page title
        </Heading>
        <Heading level={2} size="md" weight="medium" tone="muted">
          Supporting section
        </Heading>
        <Heading level={3} size="lg" tone="accent">
          Brand-accented section
        </Heading>
        <Heading level={4} size="sm" tone="danger">
          Problem area
        </Heading>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
