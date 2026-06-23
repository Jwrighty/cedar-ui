import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";

function Example() {
  return (
    <Popover.Root>
      <Popover.Trigger>Open details</Popover.Trigger>
      <Popover.Content aria-label="Details">
        <button type="button">First action</button>
        <a href="#more">Learn more</a>
      </Popover.Content>
    </Popover.Root>
  );
}

describe("Popover", () => {
  it("opens from its trigger and moves focus into the content", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(
      screen.queryByRole("dialog", { name: "Open details" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open details" }));

    const popover = screen.getByRole("dialog", { name: "Open details" });
    expect(popover).toBeInTheDocument();
    await waitFor(() =>
      expect(popover).toContainElement(document.activeElement as HTMLElement),
    );
  });

  it("closes on Escape and restores focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open details" });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "Open details" }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes when the user presses outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Outside</button>
        <Example />
      </div>,
    );

    const outside = screen.getByRole("button", { name: "Outside" });
    await user.click(screen.getByRole("button", { name: "Open details" }));
    await user.click(outside);

    expect(
      screen.queryByRole("dialog", { name: "Open details" }),
    ).not.toBeInTheDocument();
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();

    function ControlledExample() {
      const [isOpen, setOpen] = useState(false);
      return (
        <Popover.Root
          isOpen={isOpen}
          onOpenChange={(nextOpen) => {
            onOpenChange(nextOpen);
            setOpen(nextOpen);
          }}
        >
          <Popover.Trigger>Toggle details</Popover.Trigger>
          <Popover.Content aria-label="Controlled details">
            Controlled content
          </Popover.Content>
        </Popover.Root>
      );
    }

    const user = userEvent.setup();
    render(<ControlledExample />);

    await user.click(screen.getByRole("button", { name: "Toggle details" }));

    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(
      screen.getByRole("dialog", { name: "Toggle details" }),
    ).toBeInTheDocument();
  });

  it("supports defaultOpen and forwards theme, className, and style to the surface", () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open themed details</Popover.Trigger>
        <Popover.Content
          aria-label="Themed details"
          className="consumer-class"
          style={{ inlineSize: 320 }}
          data-theme="dark"
        >
          Themed content
        </Popover.Content>
      </Popover.Root>,
    );

    const popover = screen.getByRole("dialog", { name: "Open themed details" });
    expect(popover).toHaveClass("consumer-class");
    expect(popover).toHaveStyle({ inlineSize: "320px" });
    expect(popover).toHaveAttribute("data-theme", "dark");
  });

  it("has no axe violations when open", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open details" }));

    expect(
      await axe(screen.getByRole("dialog", { name: "Open details" })),
    ).toHaveNoViolations();
  });
});
