import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { IconButton } from "./IconButton";

function Glyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

describe("IconButton", () => {
  it("exposes its accessible name from aria-label", () => {
    render(
      <IconButton aria-label="Add item">
        <Glyph />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
  });

  it("fires onPress when activated", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(
      <IconButton aria-label="Add item" onPress={onPress}>
        <Glyph />
      </IconButton>,
    );

    await user.click(screen.getByRole("button", { name: "Add item" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when isDisabled", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(
      <IconButton aria-label="Add item" isDisabled onPress={onPress}>
        <Glyph />
      </IconButton>,
    );

    await user.click(screen.getByRole("button", { name: "Add item" }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("has no axe violations across variants", async () => {
    const { container } = render(
      <>
        <IconButton aria-label="Primary add" variant="primary">
          <Glyph />
        </IconButton>
        <IconButton aria-label="Secondary add" variant="secondary">
          <Glyph />
        </IconButton>
        <IconButton aria-label="Ghost add" variant="ghost">
          <Glyph />
        </IconButton>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
