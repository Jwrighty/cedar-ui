import type { ReactNode } from "react";

import { StatusPill } from "@jwrighty/cedar-react";

import type { Run } from "@/lib/observe/domain";
import type { RunSortField } from "@/lib/observe/runs-query";

export interface RunColumn {
  id: RunSortField;
  header: string;
  isNumeric: boolean;
  cell: (run: Run) => ReactNode;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatTokens(run: Run): string {
  return new Intl.NumberFormat("en-US").format(run.tokensIn + run.tokensOut);
}

export function formatCost(costUsd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(costUsd);
}

export function formatLatency(durationMs: Run["durationMs"]): string {
  if (durationMs === null) return "—";
  return durationMs >= 1000
    ? `${(durationMs / 1000).toFixed(1)}s`
    : `${durationMs}ms`;
}

function statusLabel(status: Run["status"]): string {
  return status[0]!.toUpperCase() + status.slice(1);
}

export const RUN_COLUMNS: RunColumn[] = [
  {
    id: "time",
    header: "Time",
    isNumeric: false,
    cell: (r) => formatTime(r.startedAt),
  },
  { id: "label", header: "Run", isNumeric: false, cell: (r) => r.label },
  { id: "model", header: "Model", isNumeric: false, cell: (r) => r.model },
  {
    id: "status",
    header: "Status",
    isNumeric: false,
    cell: (r) => (
      <span key={r.status} className="runs-status-cell">
        <StatusPill status={r.status} size="sm">
          {statusLabel(r.status)}
        </StatusPill>
      </span>
    ),
  },
  {
    id: "tokens",
    header: "Tokens",
    isNumeric: true,
    cell: (r) => formatTokens(r),
  },
  {
    id: "cost",
    header: "Cost",
    isNumeric: true,
    cell: (r) => formatCost(r.costUsd),
  },
  {
    id: "latency",
    header: "Latency",
    isNumeric: true,
    cell: (r) => formatLatency(r.durationMs),
  },
];
