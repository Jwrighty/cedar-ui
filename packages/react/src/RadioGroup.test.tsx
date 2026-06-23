import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Radio, RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  it("associates its label and supports uncontrolled selection by click", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup label="Notification frequency" defaultValue="daily">
        <Radio value="daily">Daily</Radio>
        <Radio value="weekly">Weekly</Radio>
      </RadioGroup>,
    );

    const group = screen.getByRole("radiogroup", {
      name: "Notification frequency",
    });
    const daily = screen.getByRole("radio", { name: "Daily" });
    const weekly = screen.getByRole("radio", { name: "Weekly" });

    expect(group).toBeInTheDocument();
    expect(daily).toBeChecked();

    await user.click(weekly);

    expect(weekly).toBeChecked();
    expect(daily).not.toBeChecked();
  });

  it("reports the selected value when controlled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup
        label="Notification frequency"
        value="daily"
        onChange={onChange}
      >
        <Radio value="daily">Daily</Radio>
        <Radio value="weekly">Weekly</Radio>
      </RadioGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "Weekly" }));

    expect(onChange).toHaveBeenCalledWith("weekly");
  });

  it("moves focus and selection with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup label="Notification frequency" defaultValue="daily">
        <Radio value="daily">Daily</Radio>
        <Radio value="weekly">Weekly</Radio>
      </RadioGroup>,
    );

    const daily = screen.getByRole("radio", { name: "Daily" });
    const weekly = screen.getByRole("radio", { name: "Weekly" });
    await user.click(daily);
    await user.keyboard("{ArrowDown}");

    expect(weekly).toHaveFocus();
    expect(weekly).toBeChecked();
  });

  it("associates description and error text with an invalid group", () => {
    render(
      <RadioGroup
        label="Plan"
        description="Choose one billing plan."
        isInvalid
        errorMessage="Select a plan."
      >
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>,
    );

    const group = screen.getByRole("radiogroup", { name: "Plan" });
    expect(group).toBeInvalid();
    expect(group).toHaveAccessibleDescription(/Choose one billing plan/);
    expect(group).toHaveAccessibleDescription(/Select a plan/);
  });

  it("supports disabled groups and individual options", () => {
    render(
      <>
        <RadioGroup label="Disabled group" isDisabled>
          <Radio value="one">Group option</Radio>
        </RadioGroup>
        <RadioGroup label="Mixed group">
          <Radio value="enabled">Enabled option</Radio>
          <Radio value="disabled" isDisabled>
            Disabled option
          </Radio>
        </RadioGroup>
      </>,
    );

    expect(screen.getByRole("radio", { name: "Group option" })).toBeDisabled();
    expect(
      screen.getByRole("radio", { name: "Disabled option" }),
    ).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Enabled option" })).toBeEnabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <RadioGroup
        label="Plan"
        description="Choose one billing plan."
        defaultValue="free"
      >
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="enterprise" isDisabled>
          Enterprise
        </Radio>
      </RadioGroup>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
