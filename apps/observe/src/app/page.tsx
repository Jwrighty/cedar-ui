import { Heading, Text } from "@jwrighty/cedar-react";

import type { OverviewMetricKey } from "@/lib/observe/domain";

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
          <OverviewRecentRunsPreview />
        </div>

        <MotionStatus>
          Rendered from deterministic seed data with tuned Suspense boundaries.
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
