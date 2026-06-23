import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("describes its trigger when keyboard focus opens it", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip.Trigger delay={0} closeDelay={0}>
        <Button>Save</Button>
        <Tooltip>Save your changes</Tooltip>
      </Tooltip.Trigger>,
    );

    await user.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Save your changes",
    );
    expect(
      screen.getByRole("button", { name: "Save" }),
    ).toHaveAccessibleDescription("Save your changes");
  });

  it("dismisses when focus leaves the trigger", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip.Trigger delay={0} closeDelay={0}>
          <Button>Save</Button>
          <Tooltip>Save your changes</Tooltip>
        </Tooltip.Trigger>
        <Button>Next action</Button>
      </>,
    );

    await user.tab();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await user.tab();

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on hover and dismisses when hover leaves", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip.Trigger delay={0} closeDelay={0}>
        <Button>Save</Button>
        <Tooltip>Save your changes</Tooltip>
      </Tooltip.Trigger>,
    );
    const trigger = screen.getByRole("button", { name: "Save" });

    // React Aria intentionally ignores synthetic hover after keyboard modality.
    // A pointer press mirrors the browser's modality transition before hover.
    await user.click(document.body);
    await user.hover(trigger);
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await user.unhover(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("forwards its ref, extension props, theme, and placement variant", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tooltip.Trigger isOpen>
        <Button>Save</Button>
        <Tooltip
          ref={ref}
          placement="bottom"
          className="consumer-tooltip"
          style={{ maxWidth: 240 }}
          data-theme="dark"
        >
          Save your changes
        </Tooltip>
      </Tooltip.Trigger>,
    );

    const tooltip = screen.getByRole("tooltip");
    expect(
      screen.getByRole("button", { name: "Save" }),
    ).toHaveAccessibleDescription("Save your changes");
    expect(ref.current).toBe(tooltip);
    expect(tooltip).toHaveClass("consumer-tooltip");
    expect(tooltip).toHaveStyle({ maxWidth: "240px" });
    expect(tooltip).toHaveAttribute("data-theme", "dark");
    expect(tooltip).toHaveAttribute("data-side", "bottom");
  });

  it("has no axe violations when open", async () => {
    const { container } = render(
      <Tooltip.Trigger isOpen>
        <Button>Save</Button>
        <Tooltip>Save your changes</Tooltip>
      </Tooltip.Trigger>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
