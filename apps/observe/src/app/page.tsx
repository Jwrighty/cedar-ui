import { Heading, Text } from "@jwrighty/cedar-react";
import type { CSSProperties } from "react";

import type { OverviewMetricKey } from "@/lib/observe/domain";
import {
  isObserveTestMode,
  parseSlowMoMultiplier,
  type SlowMoMultiplier,
} from "@/lib/observe/latency";

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
  const replayKey = firstParam(resolvedSearchParams?.replay) ?? "initial";
  const slowMoMultiplier = parseSlowMoMultiplier(resolvedSearchParams?.slowMo);
  // Honor an explicit `?testMode=1` so streaming-order e2e tests get the
  // staggered latencies even when they reuse a dev server started without
  // OBSERVE_TEST_MODE=1; otherwise fall back to the server's env.
  const testMode =
    firstParam(resolvedSearchParams?.testMode) === "1" || isObserveTestMode();
  const demoKey = `${replayKey}-${slowMoMultiplier}`;

  return (
    <DashboardShell>
      <section
        className="observe-panel"
        aria-labelledby="observe-title"
        style={demoMotionStyle(slowMoMultiplier)}
      >
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
            <OverviewMetricsRow
              key={`metrics-${demoKey}`}
              failMetric={failMetric}
              testMode={testMode}
              slowMoMultiplier={slowMoMultiplier}
            />
            <OverviewRunsChart
              key={`runs-chart-${demoKey}`}
              testMode={testMode}
              slowMoMultiplier={slowMoMultiplier}
            />
          </div>
          <OverviewCharts
            key={`charts-${demoKey}`}
            testMode={testMode}
            slowMoMultiplier={slowMoMultiplier}
          />
          <OverviewRecentRunsPreview
            key={`recent-runs-${demoKey}`}
            testMode={testMode}
            slowMoMultiplier={slowMoMultiplier}
          />
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

function demoMotionStyle(
  slowMoMultiplier: SlowMoMultiplier,
): CSSProperties &
  Record<
    | "--semantic-motion-duration-feedback"
    | "--semantic-motion-duration-settle"
    | "--semantic-motion-duration-draw",
    string
  > {
  return {
    "--semantic-motion-duration-feedback": `calc(var(--base-motion-duration-fast) * ${slowMoMultiplier})`,
    "--semantic-motion-duration-settle": `calc(var(--base-motion-duration-base) * ${slowMoMultiplier})`,
    "--semantic-motion-duration-draw": `calc(var(--base-motion-duration-draw) * ${slowMoMultiplier})`,
  };
}
