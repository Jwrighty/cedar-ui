import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders a vertical flow as the requested element with semantic gap", () => {
    render(
      <Stack as="ul" gap="lg">
        <li>First</li>
        <li>Second</li>
      </Stack>,
    );

    const stack = screen.getByRole("list");
    expect(stack).toHaveAttribute("data-gap", "lg");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("forwards its ref and passthrough props", () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <Stack ref={ref} as="ul" aria-label="Steps" className="consumer-class" />,
    );

    const stack = screen.getByRole("list", { name: "Steps" });
    expect(ref.current).toBe(stack);
    expect(stack).toHaveClass("consumer-class");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Stack as="ol" aria-label="Setup steps">
        <li>Install</li>
        <li>Configure</li>
      </Stack>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
