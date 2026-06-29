import Link from "next/link";
import { Suspense } from "react";

import {
  Heading,
  Skeleton,
  StatusPill,
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
} from "@jwrighty/cedar-react";

import { overviewRecentRunsPayload } from "@/lib/observe/api";
import type { Run, RunStatus } from "@/lib/observe/domain";

export function OverviewRecentRunsPreview({
  testMode,
}: {
  testMode?: boolean;
}) {
  return (
    <Suspense fallback={<OverviewRecentRunsSkeleton />}>
      <OverviewRecentRunsCard testMode={testMode} />
    </Suspense>
  );
}

async function OverviewRecentRunsCard({ testMode }: { testMode?: boolean }) {
  const payload = await overviewRecentRunsPayload({ testMode });

  return (
    <article
      className="recent-runs-card recent-runs-card--loaded"
      data-testid="overview-recent-runs"
      aria-labelledby="recent-runs-title"
    >
      <RecentRunsHeader />

      <div className="recent-runs-table-wrap">
        <Table
          className="recent-runs-table"
          density="compact"
          aria-label="Recent runs"
        >
          <RecentRunsTableHead />
          <tbody>
            {payload.runs.map((run) => (
              <TableRow key={run.id} isInteractive data-status={run.status}>
                <TableCell className="recent-runs-table__run">
                  <Link
                    className="recent-runs-link"
                    href={`/runs/${run.id}`}
                    aria-label={`Open trace for ${run.label}`}
                  >
                    {run.label}
                  </Link>
                  <span>{run.model}</span>
                </TableCell>
                <TableCell>
                  <StatusPill status={run.status} size="sm">
                    {formatStatus(run.status)}
                  </StatusPill>
                </TableCell>
                <TableCell isNumeric align="end">
                  {formatNumber(run.tokensIn + run.tokensOut)}
                </TableCell>
                <TableCell isNumeric align="end">
                  {formatCost(run.costUsd)}
                </TableCell>
                <TableCell isNumeric align="end">
                  {formatDuration(run.durationMs)}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </article>
  );
}

function OverviewRecentRunsSkeleton() {
  return (
    <article
      className="recent-runs-card recent-runs-card--skeleton"
      aria-label="Loading recent runs"
      data-testid="overview-recent-runs-skeleton"
    >
      <RecentRunsHeader />

      <div className="recent-runs-table-wrap">
        <Table
          className="recent-runs-table"
          density="compact"
          aria-hidden="true"
        >
          <RecentRunsTableHead />
          <tbody>
            {Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                <TableCell className="recent-runs-table__run">
                  <Skeleton
                    className="recent-runs-skeleton recent-runs-skeleton--label"
                    shape="text"
                  />
                  <Skeleton
                    className="recent-runs-skeleton recent-runs-skeleton--model"
                    shape="text"
                  />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className="recent-runs-skeleton recent-runs-skeleton--pill"
                    shape="rounded"
                  />
                </TableCell>
                <TableCell align="end">
                  <Skeleton
                    className="recent-runs-skeleton recent-runs-skeleton--number"
                    shape="text"
                  />
                </TableCell>
                <TableCell align="end">
                  <Skeleton
                    className="recent-runs-skeleton recent-runs-skeleton--number"
                    shape="text"
                  />
                </TableCell>
                <TableCell align="end">
                  <Skeleton
                    className="recent-runs-skeleton recent-runs-skeleton--number"
                    shape="text"
                  />
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </article>
  );
}

function RecentRunsHeader() {
  return (
    <div className="recent-runs-card__header">
      <Heading id="recent-runs-title" level={3} size="sm">
        Recent runs
      </Heading>

      <Link className="recent-runs-feed-link" href="/runs">
        View feed
      </Link>
    </div>
  );
}

function RecentRunsTableHead() {
  return (
    <thead>
      <TableRow>
        <TableHeaderCell scope="col">Run</TableHeaderCell>
        <TableHeaderCell scope="col">Status</TableHeaderCell>
        <TableHeaderCell scope="col" isNumeric align="end">
          Tokens
        </TableHeaderCell>
        <TableHeaderCell scope="col" isNumeric align="end">
          Cost
        </TableHeaderCell>
        <TableHeaderCell scope="col" isNumeric align="end">
          Latency
        </TableHeaderCell>
      </TableRow>
    </thead>
  );
}

function formatStatus(status: RunStatus) {
  return status[0]!.toUpperCase() + status.slice(1);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCost(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatDuration(valueMs: Run["durationMs"]) {
  if (valueMs === null) {
    return "Running";
  }

  return valueMs >= 1000 ? `${(valueMs / 1000).toFixed(1)}s` : `${valueMs}ms`;
}
