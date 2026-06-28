import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("lets the caller control dimensions and shape", () => {
    render(
      <Skeleton
        shape="circle"
        style={{ width: 40, height: 40 }}
        data-testid="avatar-loading"
      />,
    );

    const skeleton = screen.getByTestId("avatar-loading");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveAttribute("data-shape", "circle");
    expect(skeleton).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("forwards ref and className", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Skeleton ref={ref} className="consumer-class" data-testid="skeleton" />,
    );

    const skeleton = screen.getByTestId("skeleton");
    expect(ref.current).toBe(skeleton);
    expect(skeleton).toHaveClass("consumer-class");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div aria-label="Loading metrics" role="status">
        <Skeleton style={{ height: 96 }} />
      </div>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
