import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tabs } from "./Tabs";
import type { Key } from "react-aria-components";

function TabsExample() {
  return (
    <Tabs.Root defaultSelectedKey="overview">
      <Tabs.List aria-label="Project sections">
        <Tabs.Tab id="overview">Overview</Tabs.Tab>
        <Tabs.Tab id="activity">Activity</Tabs.Tab>
        <Tabs.Tab id="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="overview">Overview panel</Tabs.Panel>
      <Tabs.Panel id="activity">Activity panel</Tabs.Panel>
      <Tabs.Panel id="settings">Settings panel</Tabs.Panel>
    </Tabs.Root>
  );
}

describe("Tabs", () => {
  it("switches the active panel by click", async () => {
    const user = userEvent.setup();
    render(<TabsExample />);

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tabpanel", { name: "Overview" }),
    ).toHaveTextContent("Overview panel");

    await user.click(screen.getByRole("tab", { name: "Activity" }));

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tabpanel", { name: "Activity" }),
    ).toHaveTextContent("Activity panel");
  });

  it("moves selection with keyboard arrows", async () => {
    const user = userEvent.setup();
    render(<TabsExample />);

    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tabpanel", { name: "Activity" }),
    ).toHaveTextContent("Activity panel");
  });

  it("supports controlled selection", async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();

    function ControlledTabs() {
      const [selectedKey, setSelectedKey] = useState<Key>("overview");

      return (
        <Tabs.Root
          selectedKey={selectedKey}
          onSelectionChange={(key) => {
            onSelectionChange(key);
            setSelectedKey(key);
          }}
        >
          <Tabs.List aria-label="Controlled sections">
            <Tabs.Tab id="overview">Overview</Tabs.Tab>
            <Tabs.Tab id="activity">Activity</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="overview">Overview panel</Tabs.Panel>
          <Tabs.Panel id="activity">Activity panel</Tabs.Panel>
        </Tabs.Root>
      );
    }

    render(<ControlledTabs />);

    await user.click(screen.getByRole("tab", { name: "Activity" }));

    expect(onSelectionChange).toHaveBeenCalledWith("activity");
    expect(
      screen.getByRole("tabpanel", { name: "Activity" }),
    ).toHaveTextContent("Activity panel");
  });

  it("delegates tab to panel ARIA association to React Aria", () => {
    render(<TabsExample />);

    const tab = screen.getByRole("tab", { name: "Overview" });
    const panel = screen.getByRole("tabpanel", { name: "Overview" });

    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
  });

  it("does not select a disabled tab", async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultSelectedKey="overview">
        <Tabs.List aria-label="Plan sections">
          <Tabs.Tab id="overview">Overview</Tabs.Tab>
          <Tabs.Tab id="billing" isDisabled>
            Billing
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="overview">Overview panel</Tabs.Panel>
        <Tabs.Panel id="billing">Billing panel</Tabs.Panel>
      </Tabs.Root>,
    );

    await user.click(screen.getByRole("tab", { name: "Billing" }));

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tabpanel", { name: "Overview" }),
    ).toHaveTextContent("Overview panel");
  });

  it("has no axe violations", async () => {
    const { container } = render(<TabsExample />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
