import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("toggles an uncontrolled setting by click and keyboard", async () => {
    const user = userEvent.setup();
    render(<Switch>Notifications</Switch>);

    const control = screen.getByRole("switch", { name: "Notifications" });
    expect(control).not.toBeChecked();

    await user.click(control);
    expect(control).toBeChecked();

    await user.keyboard(" ");
    expect(control).not.toBeChecked();
  });

  it("reports controlled changes using React Aria naming", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch isSelected={false} onChange={onChange}>
        Automatic updates
      </Switch>,
    );

    await user.click(screen.getByRole("switch", { name: "Automatic updates" }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("honors defaultSelected and prevents changes when disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch defaultSelected isDisabled onChange={onChange}>
        Location services
      </Switch>,
    );

    const control = screen.getByRole("switch", { name: "Location services" });
    expect(control).toBeChecked();
    expect(control).toBeDisabled();

    await user.click(control);
    expect(control).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no axe violations across on, off, and disabled states", async () => {
    const { container } = render(
      <>
        <Switch>Notifications</Switch>
        <Switch defaultSelected>Automatic updates</Switch>
        <Switch isDisabled>Location services</Switch>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
