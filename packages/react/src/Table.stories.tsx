import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";
import { Table, TableCell, TableHeaderCell, TableRow } from "./Table";
import { tableMeta } from "./Table.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Data Display/Table",
  component: Table,
  parameters: {
    layout: "centered",
    docs: { description: { component: usageDocs(tableMeta) } },
  },
  args: { density: "comfortable" },
  argTypes: {
    density: {
      control: "inline-radio",
      options: ["compact", "comfortable"],
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  ["run_123", "success", "gpt-4.1", "12,480", "$0.42", "842ms"],
  ["run_124", "running", "o4-mini", "8,204", "$0.18", "1.2s"],
  ["run_125", "error", "gpt-4.1", "2,100", "$0.08", "320ms"],
] as const;

export const Runs: Story = {
  render: (args) => (
    <Table {...args} aria-label="Runs" style={{ width: 720 }}>
      <thead>
        <TableRow>
          <TableHeaderCell scope="col">Run</TableHeaderCell>
          <TableHeaderCell scope="col">Status</TableHeaderCell>
          <TableHeaderCell scope="col">Model</TableHeaderCell>
          <TableHeaderCell scope="col" align="end" isNumeric>
            Tokens
          </TableHeaderCell>
          <TableHeaderCell scope="col" align="end" isNumeric>
            Cost
          </TableHeaderCell>
          <TableHeaderCell scope="col" align="end" isNumeric>
            Latency
          </TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        {rows.map(([run, status, model, tokens, cost, latency]) => (
          <TableRow key={run} isInteractive>
            <TableCell>{run}</TableCell>
            <TableCell>
              <Badge status={status}>{status}</Badge>
            </TableCell>
            <TableCell>{model}</TableCell>
            <TableCell align="end" isNumeric>
              {tokens}
            </TableCell>
            <TableCell align="end" isNumeric>
              {cost}
            </TableCell>
            <TableCell align="end" isNumeric>
              {latency}
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  ),
};

export const Densities: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--semantic-space-gap-lg)" }}>
      {(["compact", "comfortable"] as const).map((density) => (
        <Table key={density} density={density} aria-label={`${density} runs`}>
          <thead>
            <TableRow>
              <TableHeaderCell scope="col">Density</TableHeaderCell>
              <TableHeaderCell scope="col" align="end" isNumeric>
                Value
              </TableHeaderCell>
            </TableRow>
          </thead>
          <tbody>
            <TableRow>
              <TableCell>{density}</TableCell>
              <TableCell align="end" isNumeric>
                1,248
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
      ))}
    </div>
  ),
};
