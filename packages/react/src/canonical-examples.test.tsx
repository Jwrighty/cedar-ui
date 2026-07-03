import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { canonicalExamples } from "./canonical-examples";

describe("canonicalExamples", () => {
  it.each(Object.entries(canonicalExamples))(
    "renders the %s canonical example",
    (_, Example) => {
      const { container } = render(<Example />);

      expect(container).not.toBeEmptyDOMElement();
    },
  );
});
