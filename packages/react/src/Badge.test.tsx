import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Badge, StatusPill } from "./Badge";

describe("Badge", () => {
  it("maps status variants to data attributes", () => {
    render(<Badge status="success">Success</Badge>);

    const badge = screen.getByText("Success");
    expect(badge).toHaveAttribute("data-status", "success");
    expect(badge).toHaveAttribute("data-size", "md");
  });

  it("exposes StatusPill as an alias", () => {
    render(<StatusPill status="running">Running</StatusPill>);

    expect(screen.getByText("Running")).toHaveAttribute(
      "data-status",
      "running",
    );
  });

  it("forwards ref, className, style, and native props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge
        ref={ref}
        className="consumer-class"
        style={{ minWidth: 80 }}
        title="Current state"
      >
        Neutral
      </Badge>,
    );

    const badge = screen.getByTitle("Current state");
    expect(ref.current).toBe(badge);
    expect(badge).toHaveClass("consumer-class");
    expect(badge).toHaveStyle({ minWidth: "80px" });
  });

  it("has no axe violations across statuses", async () => {
    const { container } = render(
      <>
        <Badge>Neutral</Badge>
        <Badge status="running">Running</Badge>
        <Badge status="success">Success</Badge>
        <Badge status="error">Error</Badge>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
