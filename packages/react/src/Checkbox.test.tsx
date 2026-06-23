import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("toggles an uncontrolled checkbox queried by its label", async () => {
    const user = userEvent.setup();
    render(<Checkbox defaultSelected>Accept terms</Checkbox>);

    const checkbox = screen.getByLabelText("Accept terms");
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it("requests a controlled change when toggled with the keyboard", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Checkbox isSelected={false} onChange={onChange}>
        Send updates
      </Checkbox>,
    );

    const checkbox = screen.getByLabelText("Send updates");
    checkbox.focus();
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledWith(true);
    expect(checkbox).not.toBeChecked();
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox isDisabled>Archive project</Checkbox>);

    const checkbox = screen.getByLabelText("Archive project");
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it("forwards its ref to the input and exposes validation state", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Checkbox ref={ref} isIndeterminate isInvalid>
        Select all
      </Checkbox>,
    );

    const checkbox = screen.getByLabelText("Select all");
    expect(ref.current).toBe(checkbox);
    expect(checkbox).toBePartiallyChecked();
    expect(checkbox).toBeInvalid();
  });

  it("passes className and style through to the label", () => {
    render(
      <Checkbox className="consumer-class" style={{ marginTop: 8 }}>
        Styled choice
      </Checkbox>,
    );

    const label = screen.getByLabelText("Styled choice").closest("label");
    expect(label).toHaveClass("consumer-class");
    expect(label).toHaveStyle({ marginTop: "8px" });
  });

  it("has no axe violations across states", async () => {
    const { container } = render(
      <>
        <Checkbox>Unselected</Checkbox>
        <Checkbox isSelected>Selected</Checkbox>
        <Checkbox isIndeterminate>Indeterminate</Checkbox>
        <Checkbox isDisabled>Disabled</Checkbox>
        <Checkbox isInvalid>Invalid</Checkbox>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
