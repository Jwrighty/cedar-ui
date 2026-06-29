import { headers } from "next/headers";

import { Heading, Text } from "@jwrighty/cedar-react";

import type { OverviewMetricKey } from "@/lib/observe/domain";

import { DashboardShell } from "./dashboard-shell";
import { MotionStatus } from "./motion-status";
import { OverviewCharts, OverviewRunsChart } from "./overview-charts";
import { OverviewMetricsRow } from "./overview-metrics";

export const dynamic = "force-dynamic";

interface RunsResponse {
  runs: Array<{
    id: string;
    label: string;
    model: string;
    status: "running" | "success" | "error";
    costUsd: number;
    durationMs: number | null;
  }>;
}

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const metricKeys = new Set<OverviewMetricKey>([
  "runs",
  "successRate",
  "totalCost",
  "p95Latency",
]);

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const failMetric = asOverviewMetricKey(resolvedSearchParams?.metricError);
  const run = await fetchFirstRun();

  return (
    <DashboardShell>
      <section className="observe-panel" aria-labelledby="observe-title">
        <header className="observe-panel__intro">
          <Text className="observe-kicker" size="sm" tone="muted">
            Overview
          </Text>
          <Heading id="observe-title" level={2} size="xl">
            Live run health
          </Heading>
          <Text tone="muted">
            Seeded data is flowing through the mock backend and into a server
            component.
          </Text>
        </header>

        <div className="overview-grid">
          <div className="overview-top">
            <OverviewMetricsRow failMetric={failMetric} />
            <OverviewRunsChart />
          </div>
          <OverviewCharts />

          <article className="run-card" data-status={run.status}>
          <div>
            <Text size="sm" tone="muted">
              Latest run
            </Text>
            <Heading level={2} size="md">
              {run.label}
            </Heading>
          </div>
          <dl className="run-facts">
            <div>
              <dt>Status</dt>
              <dd>{run.status}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{run.model}</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd>${run.costUsd.toFixed(4)}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>
                {run.durationMs === null ? "running" : `${run.durationMs}ms`}
              </dd>
            </div>
          </dl>
          </article>
        </div>

        <MotionStatus>
          Rendered from `/api/runs` with deterministic seed data.
        </MotionStatus>
      </section>
    </DashboardShell>
  );
}

function asOverviewMetricKey(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  return firstValue && metricKeys.has(firstValue as OverviewMetricKey)
    ? (firstValue as OverviewMetricKey)
    : null;
}

async function fetchFirstRun() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "127.0.0.1:3010";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const response = await fetch(`${protocol}://${host}/api/runs?limit=1`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load observe runs.");
  }

  const payload = (await response.json()) as RunsResponse;
  const run = payload.runs[0];
  if (!run) {
    throw new Error("Observe generated no runs.");
  }

  return run;
}
