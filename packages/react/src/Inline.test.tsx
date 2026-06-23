import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Inline } from "./Inline";

describe("Inline", () => {
  it("renders a horizontal flow as the requested element with semantic gap", () => {
    render(
      <Inline as="nav" aria-label="Pagination" gap="sm">
        <a href="/previous">Previous</a>
        <a href="/next">Next</a>
      </Inline>,
    );

    const inline = screen.getByRole("navigation", { name: "Pagination" });
    expect(inline).toHaveAttribute("data-gap", "sm");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("preserves keyboard access to composed interactive children", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLElement>();
    render(
      <Inline ref={ref} as="nav" aria-label="Actions">
        <a href="/edit">Edit</a>
        <button type="button">Delete</button>
      </Inline>,
    );

    await user.tab();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
    expect(ref.current).toBe(
      screen.getByRole("navigation", { name: "Actions" }),
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Inline as="nav" aria-label="Pagination">
        <a href="/previous">Previous</a>
        <a href="/next">Next</a>
      </Inline>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
