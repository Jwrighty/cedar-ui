import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Text } from "./Text";

describe("Text", () => {
  it("keeps semantic element selection independent from visual size", () => {
    render(
      <Text as="span" size="2xl">
        Account balance
      </Text>,
    );

    const text = screen.getByText("Account balance");

    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveAttribute("data-size", "2xl");
  });

  it("forwards refs and passes consumer className/style through", () => {
    const ref = createRef<HTMLElement>();

    render(
      <Text
        ref={ref}
        as="div"
        className="consumer-class"
        style={{ textAlign: "center" }}
      >
        Centred copy
      </Text>,
    );

    expect(ref.current).toBe(screen.getByText("Centred copy"));
    expect(ref.current).toHaveClass("consumer-class");
    expect(ref.current).toHaveStyle({ textAlign: "center" });
  });

  it("has no axe violations across variants", async () => {
    const { container } = render(
      <>
        <Text size="xs" weight="regular" tone="default">
          Default body copy
        </Text>
        <Text as="span" size="md" weight="medium" tone="muted">
          Muted inline copy
        </Text>
        <Text as="strong" size="lg" weight="semibold" tone="accent">
          Accent emphasis
        </Text>
        <Text size="sm" tone="danger">
          Destructive warning copy
        </Text>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
