import { describe, it, expect } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Dialog } from "./Dialog";

function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Delete project?</Dialog.Title>
        <p>This cannot be undone.</p>
        <Dialog.Close>Cancel</Dialog.Close>
        <Dialog.Close variant="primary">Delete</Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}

describe("Dialog", () => {
  it("opens from the trigger and labels the dialog by its title", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Delete project?");
  });

  it("moves focus into the dialog when opened", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);

    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // React Aria restores focus to the trigger asynchronously on close.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes when a Dialog.Close button is pressed", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has no axe violations when open", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(await axe(screen.getByRole("dialog"))).toHaveNoViolations();
  });
});
