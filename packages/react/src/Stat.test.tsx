import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Skeleton } from "./Skeleton";
import { MetricCard, Stat } from "./Stat";

describe("Stat", () => {
  it("renders label, value, directional delta, and visual slot", () => {
    render(
      <Stat
        label="Runs"
        value="1,248"
        delta={{ direction: "positive", value: "+8%" }}
        visual={<div aria-label="Runs sparkline" />}
      />,
    );

    expect(screen.getByText("Runs")).toBeInTheDocument();
    expect(screen.getByText("1,248")).toBeInTheDocument();
    expect(screen.getByText("+8%")).toHaveAttribute(
      "data-direction",
      "positive",
    );
    expect(screen.getByLabelText("Runs sparkline")).toBeInTheDocument();
  });

  it("exposes MetricCard as an alias", () => {
    render(<MetricCard label="Cost" value="$42.10" />);

    expect(screen.getByText("Cost")).toBeInTheDocument();
    expect(screen.getByText("$42.10")).toBeInTheDocument();
  });

  it("forwards ref, className, style, and native props to the composed Card", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stat
        ref={ref}
        label="Latency"
        value="842ms"
        className="consumer-class"
        style={{ maxWidth: 280 }}
        data-testid="stat"
      />,
    );

    const stat = screen.getByTestId("stat");
    expect(ref.current).toBe(stat);
    expect(stat).toHaveClass("consumer-class");
    expect(stat).toHaveStyle({ maxWidth: "280px" });
  });

  it("has no axe violations with a skeleton visual slot", async () => {
    const { container } = render(
      <Stat
        aria-label="Loading total cost"
        label="Total cost"
        value="$--"
        visual={<Skeleton style={{ height: 40 }} />}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
