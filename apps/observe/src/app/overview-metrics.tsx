import { Suspense } from "react";

import { Skeleton, Stat } from "@jwrighty/cedar-react";

import { overviewMetricPayload } from "@/lib/observe/api";
import type { OverviewMetric, OverviewMetricKey } from "@/lib/observe/domain";

import { MetricErrorBoundary } from "./metric-error-boundary";
import { normalizePoints, toAreaPath, toSmoothPath } from "./sparkline";

const SPARKLINE_VIEW = { width: 200, height: 48, padding: 2 } as const;

const metrics: Array<{ key: OverviewMetricKey; label: string }> = [
  { key: "runs", label: "Runs" },
  { key: "successRate", label: "Success rate" },
  { key: "totalCost", label: "Total cost" },
  { key: "p95Latency", label: "P95 latency" },
];

export function OverviewMetricsRow({
  failMetric,
}: {
  failMetric: OverviewMetricKey | null;
}) {
  return (
    <section className="overview-metrics" aria-label="Overview metrics">
      {metrics.map((metric) => (
        <MetricErrorBoundary
          key={`${metric.key}-${failMetric === metric.key ? "failed" : "ready"}`}
          label={metric.label}
        >
          <Suspense fallback={<OverviewMetricSkeleton metric={metric.key} />}>
            <OverviewMetricCard metric={metric.key} failMetric={failMetric} />
          </Suspense>
        </MetricErrorBoundary>
      ))}
    </section>
  );
}

async function OverviewMetricCard({
  metric,
  failMetric,
}: {
  metric: OverviewMetricKey;
  failMetric: OverviewMetricKey | null;
}) {
  const payload = await overviewMetricPayload({
    metric,
    failMetric,
  });

  return (
    <Stat
      className="metric-card metric-card--loaded"
      data-testid={`overview-metric-${metric}`}
      label={payload.label}
      value={formatMetricValue(payload)}
      delta={{
        direction: payload.delta.direction,
        value: formatDelta(payload.delta.value),
      }}
      visual={<MetricSparkline metric={payload} />}
    />
  );
}

function OverviewMetricSkeleton({ metric }: { metric: OverviewMetricKey }) {
  return (
    <div
      className="metric-card metric-card--skeleton"
      data-testid={`overview-metric-skeleton-${metric}`}
      aria-label="Loading metric"
    >
      <Skeleton className="metric-card__label-skeleton" shape="text" />
      <div className="metric-card__value-row-skeleton">
        <Skeleton className="metric-card__value-skeleton" shape="text" />
        <Skeleton className="metric-card__delta-skeleton" shape="text" />
      </div>
      <Skeleton className="metric-card__sparkline-skeleton" shape="rounded" />
    </div>
  );
}

function MetricSparkline({ metric }: { metric: OverviewMetric }) {
  if (metric.key === "runs") {
    return <MetricBars metric={metric} />;
  }

  return <MetricLine metric={metric} />;
}

function MetricBars({ metric }: { metric: OverviewMetric }) {
  const max = Math.max(...metric.sparkline, 1);

  return (
    <div className="metric-sparkline" role="img" aria-label={sparklineLabel(metric)}>
      {metric.sparkline.map((value, index) => (
        <span
          // Bars share bucket values; index keeps duplicate heights stable.
          key={`${metric.key}-${index}`}
          style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function MetricLine({ metric }: { metric: OverviewMetric }) {
  const points = normalizePoints(metric.sparkline, SPARKLINE_VIEW);
  const line = toSmoothPath(points);
  const area = toAreaPath(line, points, SPARKLINE_VIEW.height);
  const gradientId = `metric-sparkline-fill-${metric.key}`;

  return (
    <svg
      className={`metric-line metric-line--${metric.delta.direction}`}
      viewBox={`0 0 ${SPARKLINE_VIEW.width} ${SPARKLINE_VIEW.height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={sparklineLabel(metric)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function sparklineLabel(metric: OverviewMetric) {
  const trend =
    metric.delta.direction === "neutral"
      ? "holding steady"
      : metric.delta.direction === "positive"
        ? "improving"
        : "regressing";
  return `${metric.label} trend across the recent window, ${trend}.`;
}

function formatMetricValue(metric: OverviewMetric) {
  switch (metric.key) {
    case "runs":
      return new Intl.NumberFormat("en-US").format(metric.value);
    case "successRate":
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(metric.value);
    case "totalCost":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(metric.value);
    case "p95Latency":
      return `${new Intl.NumberFormat("en-US").format(metric.value)}ms`;
  }
}

function formatDelta(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}
