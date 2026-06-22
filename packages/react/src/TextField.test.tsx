import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates the label with the input (query by label)", () => {
    render(<TextField label="Email" />);

    // getByLabelText only resolves if the label/input association is correct.
    expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
  });

  it("supports uncontrolled typing with defaultValue", async () => {
    const user = userEvent.setup();
    render(<TextField label="Name" defaultValue="Ada" />);

    const input = screen.getByLabelText("Name");
    expect(input).toHaveValue("Ada");

    await user.type(input, " Lovelace");
    expect(input).toHaveValue("Ada Lovelace");
  });

  it("calls onChange with the new value when controlled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="Name" value="" onChange={onChange} />);

    await user.type(screen.getByLabelText("Name"), "A");

    expect(onChange).toHaveBeenLastCalledWith("A");
  });

  it("does not accept input when isDisabled", async () => {
    const user = userEvent.setup();
    render(<TextField label="Name" isDisabled />);

    const input = screen.getByLabelText("Name");
    expect(input).toBeDisabled();

    await user.type(input, "hello");
    expect(input).toHaveValue("");
  });

  it("links description and error to the input for assistive tech", () => {
    render(
      <TextField
        label="Email"
        description="We'll never share it."
        isInvalid
        errorMessage="Required"
      />,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription(/We'll never share it\./);
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(/Required/);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <TextField label="Email" description="We'll never share it." />
        <TextField label="Name" isInvalid errorMessage="Required" />
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
