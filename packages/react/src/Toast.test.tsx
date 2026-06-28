import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { Toast, useToast } from "./Toast";

function ToastButtons() {
  const toast = useToast();

  return (
    <>
      <Button
        onPress={() =>
          toast.success({
            title: "Tags saved",
            description: "The trace now has 3 tags.",
          })
        }
      >
        Show success
      </Button>
      <Button
        onPress={() =>
          toast.error({
            title: "Could not save tags",
            description: "Try again.",
          })
        }
      >
        Show error
      </Button>
    </>
  );
}

function ToastHarness() {
  return (
    <Toast.Provider>
      <ToastButtons />
      <Toast.Region />
    </Toast.Provider>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("stacks success and error toasts and announces them politely", async () => {
    const user = userEvent.setup();
    render(<ToastHarness />);

    await user.click(screen.getByRole("button", { name: "Show success" }));
    await user.click(screen.getByRole("button", { name: "Show error" }));

    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(2);
    const [successStatus, errorStatus] = statuses as [HTMLElement, HTMLElement];

    expect(successStatus).toHaveTextContent("Tags saved");
    expect(successStatus).toHaveAttribute("aria-live", "polite");
    expect(successStatus.closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "success",
    );
    expect(errorStatus).toHaveTextContent("Could not save tags");
    expect(errorStatus.closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "error",
    );
  });

  it("dismisses a toast manually", async () => {
    const user = userEvent.setup();
    render(<ToastHarness />);

    await user.click(screen.getByRole("button", { name: "Show success" }));
    expect(screen.getByRole("status")).toHaveTextContent("Tags saved");

    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the configured duration", () => {
    vi.useFakeTimers();

    function AutoDismiss() {
      const toast = useToast();

      return (
        <Button
          onPress={() =>
            toast.success({
              title: "Tags saved",
              duration: 1000,
            })
          }
        >
          Show success
        </Button>
      );
    }

    render(
      <Toast.Provider>
        <AutoDismiss />
        <Toast.Region />
      </Toast.Provider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Show success" }).click();
    });

    expect(screen.getByRole("status")).toHaveTextContent("Tags saved");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Toast.Provider
        defaultToasts={[
          {
            id: "success",
            variant: "success",
            title: "Tags saved",
            description: "The trace now has 3 tags.",
            duration: null,
          },
        ]}
      >
        <Toast.Region />
      </Toast.Provider>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
