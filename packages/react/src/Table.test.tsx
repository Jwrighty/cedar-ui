import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Table, TableCell, TableHeaderCell, TableRow } from "./Table";

describe("Table primitives", () => {
  it("renders native table structure with density and numeric attributes", () => {
    render(
      <Table density="compact">
        <thead>
          <TableRow>
            <TableHeaderCell scope="col">Run</TableHeaderCell>
            <TableHeaderCell scope="col" align="end" isNumeric>
              Tokens
            </TableHeaderCell>
          </TableRow>
        </thead>
        <tbody>
          <TableRow isInteractive>
            <TableCell>run_123</TableCell>
            <TableCell align="end" isNumeric>
              12,480
            </TableCell>
          </TableRow>
        </tbody>
      </Table>,
    );

    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("data-density", "compact");
    expect(screen.getByRole("row", { name: "run_123 12,480" })).toHaveAttribute(
      "data-interactive",
      "true",
    );
    expect(screen.getByRole("cell", { name: "12,480" })).toHaveAttribute(
      "data-numeric",
      "true",
    );
  });

  it("forwards refs, className, style, and native cell props", () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <table>
        <tbody>
          <tr>
            <TableCell
              ref={ref}
              className="consumer-class"
              style={{ minWidth: 120 }}
            >
              Cost
            </TableCell>
          </tr>
        </tbody>
      </table>,
    );

    const cell = screen.getByRole("cell", { name: "Cost" });
    expect(ref.current).toBe(cell);
    expect(cell).toHaveClass("consumer-class");
    expect(cell).toHaveStyle({ minWidth: "120px" });
  });

  it("has no axe violations in a representative data table", async () => {
    const { container } = render(
      <Table aria-label="Runs">
        <thead>
          <TableRow>
            <TableHeaderCell scope="col">Run</TableHeaderCell>
            <TableHeaderCell scope="col">Status</TableHeaderCell>
            <TableHeaderCell scope="col" align="end" isNumeric>
              Latency
            </TableHeaderCell>
          </TableRow>
        </thead>
        <tbody>
          <TableRow>
            <TableCell>run_123</TableCell>
            <TableCell>Success</TableCell>
            <TableCell align="end" isNumeric>
              842ms
            </TableCell>
          </TableRow>
        </tbody>
      </Table>,
    );

    expect(
      within(screen.getByRole("table")).getByText("run_123"),
    ).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });
});
