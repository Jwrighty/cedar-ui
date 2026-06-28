import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";

describe("Card", () => {
  it("renders a token-backed outlined surface with optional slots", () => {
    render(
      <Card aria-label="Run summary">
        <CardHeader>Header</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByLabelText("Run summary")).toHaveAttribute(
      "data-padding",
      "none",
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("forwards ref, className, style, and native props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card
        ref={ref}
        padding="lg"
        className="consumer-class"
        style={{ maxWidth: 320 }}
        data-testid="card"
      />,
    );

    const card = screen.getByTestId("card");
    expect(ref.current).toBe(card);
    expect(card).toHaveClass("consumer-class");
    expect(card).toHaveStyle({ maxWidth: "320px" });
    expect(card).toHaveAttribute("data-padding", "lg");
  });

  it("has no axe violations for a named region composition", async () => {
    const { container } = render(
      <Card role="region" aria-label="Latency">
        <CardHeader>
          <h2>Latency</h2>
        </CardHeader>
        <CardBody>
          <p>P95 over the last hour.</p>
        </CardBody>
      </Card>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
