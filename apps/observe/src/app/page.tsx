import { Heading, Text } from "@jwrighty/cedar-react";

import type { OverviewMetricKey } from "@/lib/observe/domain";
import { isObserveTestMode } from "@/lib/observe/latency";

import { DashboardShell } from "./dashboard-shell";
import { MotionStatus } from "./motion-status";
import { OverviewCharts, OverviewRunsChart } from "./overview-charts";
import { OverviewMetricsRow } from "./overview-metrics";
import { OverviewRecentRunsPreview } from "./overview-recent-runs";

export const dynamic = "force-dynamic";

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
  // Honor an explicit `?testMode=1` so streaming-order e2e tests get the
  // staggered latencies even when they reuse a dev server started without
  // OBSERVE_TEST_MODE=1; otherwise fall back to the server's env.
  const testMode =
    firstParam(resolvedSearchParams?.testMode) === "1" || isObserveTestMode();

  return (
    <DashboardShell>
      <section className="observe-panel" aria-labelledby="observe-title">
        <header className="observe-panel__intro">
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
            <OverviewMetricsRow failMetric={failMetric} testMode={testMode} />
            <OverviewRunsChart />
          </div>
          <OverviewCharts />
          <OverviewRecentRunsPreview testMode={testMode} />
        </div>

        <MotionStatus>
          Rendered from deterministic seed data with tuned Suspense boundaries.
        </MotionStatus>
      </section>
    </DashboardShell>
  );
}

function asOverviewMetricKey(value: string | string[] | undefined) {
  const firstValue = firstParam(value);
  return firstValue && metricKeys.has(firstValue as OverviewMetricKey)
    ? (firstValue as OverviewMetricKey)
    : null;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
