import { Suspense } from "react";

import { headers } from "next/headers";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AreaClosed, Bar, LinePath } from "@visx/shape";

import { Heading, Skeleton, Text } from "@jwrighty/cedar-react";

import type {
  CostByModelChart,
  LatencyDistributionChart,
  OverviewChart,
  OverviewChartKey,
  RunsOverTimeChart,
} from "@/lib/observe/domain";

const CHART_VIEW = {
  width: 720,
  height: 240,
  padding: {
    top: 16,
    right: 20,
    bottom: 36,
    left: 40,
  },
} as const;

const chartCards: Array<{
  chart: OverviewChartKey;
  title: string;
  description: string;
}> = [
  {
    chart: "runs-over-time",
    title: "Runs over time",
    description: "Request volume across the current operating window.",
  },
  {
    chart: "cost-by-model",
    title: "Cost by model",
    description: "Spend concentration across active model traffic.",
  },
  {
    chart: "latency-distribution",
    title: "Latency distribution",
    description: "Completed runs grouped by response time.",
  },
];

export function OverviewCharts() {
  return (
    <section className="overview-charts" aria-label="Overview charts">
      {chartCards.map((chart) => (
        <Suspense
          key={chart.chart}
          fallback={<OverviewChartSkeleton {...chart} />}
        >
          <OverviewChartCard chart={chart.chart} />
        </Suspense>
      ))}
    </section>
  );
}

async function OverviewChartCard({ chart }: { chart: OverviewChartKey }) {
  const payload = await fetchOverviewChart(chart);

  return (
    <article
      className={`overview-chart-card overview-chart-card--${payload.key}`}
      data-testid={`overview-chart-${payload.key}`}
    >
      <ChartHeader title={payload.title} description={payload.summary} />
      {renderChart(payload)}
    </article>
  );
}

function OverviewChartSkeleton({
  chart,
  title,
  description,
}: {
  chart: OverviewChartKey;
  title: string;
  description: string;
}) {
  return (
    <article
      className={`overview-chart-card overview-chart-card--${chart} overview-chart-card--skeleton`}
      data-testid={`overview-chart-skeleton-${chart}`}
      aria-label={`Loading ${title}`}
    >
      <ChartHeader title={title} description={description} />
      <Skeleton className="overview-chart-skeleton__plot" shape="rounded" />
      <div className="overview-chart-skeleton__legend" aria-hidden="true">
        <Skeleton shape="text" />
        <Skeleton shape="text" />
        <Skeleton shape="text" />
      </div>
    </article>
  );
}

function ChartHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="overview-chart-card__header">
      <Heading level={3} size="sm">
        {title}
      </Heading>
      <Text size="sm" tone="muted">
        {description}
      </Text>
    </div>
  );
}

function renderChart(chart: OverviewChart) {
  switch (chart.key) {
    case "runs-over-time":
      return <RunsOverTimeArea chart={chart} />;
    case "cost-by-model":
      return <CostByModelBars chart={chart} />;
    case "latency-distribution":
      return <LatencyDistributionHistogram chart={chart} />;
  }
}

function RunsOverTimeArea({ chart }: { chart: RunsOverTimeChart }) {
  const frame = chartFrame();
  const maxValue = Math.max(...chart.points.map((point) => point.value), 1);
  const xScale = scaleLinear<number>({
    domain: [0, chart.points.length - 1],
    range: [0, frame.innerWidth],
  });
  const yScale = scaleLinear<number>({
    domain: [0, maxValue],
    range: [frame.innerHeight, 0],
    nice: true,
  });

  return (
    <figure className="overview-chart-figure">
      <svg
        className="overview-chart overview-chart--area"
        viewBox={`0 0 ${CHART_VIEW.width} ${CHART_VIEW.height}`}
        role="img"
        aria-label={`${chart.title}: ${chart.summary}`}
      >
        <ChartGrid frame={frame} />
        <Group
          className="overview-chart__draw overview-chart__draw--sweep"
          left={CHART_VIEW.padding.left}
          top={CHART_VIEW.padding.top}
        >
          <AreaClosed
            data={chart.points}
            x={(_, index) => xScale(index)}
            y={(point) => yScale(point.value)}
            yScale={yScale}
            className="overview-chart__area"
          />
          <LinePath
            data={chart.points}
            x={(_, index) => xScale(index)}
            y={(point) => yScale(point.value)}
            className="overview-chart__line"
          />
        </Group>
      </svg>
      <figcaption className="overview-chart-legend">
        {chart.points.at(0)?.label} to {chart.points.at(-1)?.label}
      </figcaption>
    </figure>
  );
}

function CostByModelBars({ chart }: { chart: CostByModelChart }) {
  const frame = chartFrame();
  const maxCost = Math.max(...chart.rows.map((row) => row.costUsd), 1);
  const xScale = scaleLinear<number>({
    domain: [0, maxCost],
    range: [0, frame.innerWidth],
  });
  const yScale = scaleBand<string>({
    domain: chart.rows.map((row) => row.model),
    range: [0, frame.innerHeight],
    padding: 0.32,
  });

  return (
    <figure className="overview-chart-figure">
      <svg
        className="overview-chart overview-chart--bars"
        viewBox={`0 0 ${CHART_VIEW.width} ${CHART_VIEW.height}`}
        role="img"
        aria-label={`${chart.title}: ${chart.summary}`}
      >
        <ChartGrid frame={frame} />
        <Group left={CHART_VIEW.padding.left} top={CHART_VIEW.padding.top}>
          {chart.rows.map((row, index) => {
            const y = yScale(row.model) ?? 0;

            return (
              <Group key={row.model}>
                <Bar
                  className="overview-chart__bar overview-chart__bar--horizontal"
                  data-index={index}
                  x={0}
                  y={y}
                  width={xScale(row.costUsd)}
                  height={yScale.bandwidth()}
                  rx={6}
                  style={{ animationDelay: `${index * 28}ms` }}
                />
                <text
                  className="overview-chart__bar-label"
                  x={0}
                  y={y + yScale.bandwidth() / 2}
                  dominantBaseline="middle"
                >
                  {row.model}
                </text>
                <text
                  className="overview-chart__bar-value"
                  x={Math.min(frame.innerWidth - 2, xScale(row.costUsd) + 8)}
                  y={y + yScale.bandwidth() / 2}
                  dominantBaseline="middle"
                >
                  {formatCurrency(row.costUsd)}
                </text>
              </Group>
            );
          })}
        </Group>
      </svg>
      <figcaption className="overview-chart-legend">
        {chart.rows.length} models, {sum(chart.rows, (row) => row.runCount)}{" "}
        runs
      </figcaption>
    </figure>
  );
}

function LatencyDistributionHistogram({
  chart,
}: {
  chart: LatencyDistributionChart;
}) {
  const frame = chartFrame();
  const maxCount = Math.max(...chart.buckets.map((bucket) => bucket.count), 1);
  const xScale = scaleBand<string>({
    domain: chart.buckets.map((bucket) => bucket.label),
    range: [0, frame.innerWidth],
    padding: 0.22,
  });
  const yScale = scaleLinear<number>({
    domain: [0, maxCount],
    range: [frame.innerHeight, 0],
    nice: true,
  });

  return (
    <figure className="overview-chart-figure">
      <svg
        className="overview-chart overview-chart--histogram"
        viewBox={`0 0 ${CHART_VIEW.width} ${CHART_VIEW.height}`}
        role="img"
        aria-label={`${chart.title}: ${chart.summary}`}
      >
        <ChartGrid frame={frame} />
        <Group left={CHART_VIEW.padding.left} top={CHART_VIEW.padding.top}>
          {chart.buckets.map((bucket, index) => {
            const x = xScale(bucket.label) ?? 0;
            const y = yScale(bucket.count);
            const height = frame.innerHeight - y;

            return (
              <Group key={bucket.label}>
                <Bar
                  className="overview-chart__bar overview-chart__bar--vertical"
                  data-index={index}
                  x={x}
                  y={y}
                  width={xScale.bandwidth()}
                  height={height}
                  rx={6}
                  style={{ animationDelay: `${index * 28}ms` }}
                />
                <text
                  className="overview-chart__bucket-label"
                  x={x + xScale.bandwidth() / 2}
                  y={frame.innerHeight + 22}
                  textAnchor="middle"
                >
                  {bucket.label}
                </text>
              </Group>
            );
          })}
        </Group>
      </svg>
      <figcaption className="overview-chart-legend">
        {sum(chart.buckets, (bucket) => bucket.count)} completed runs
      </figcaption>
    </figure>
  );
}

function ChartGrid({ frame }: { frame: ReturnType<typeof chartFrame> }) {
  const yLines = [0, 0.5, 1];

  return (
    <Group
      className="overview-chart__grid"
      left={CHART_VIEW.padding.left}
      top={CHART_VIEW.padding.top}
    >
      {yLines.map((position) => (
        <line
          key={position}
          x1={0}
          x2={frame.innerWidth}
          y1={frame.innerHeight * position}
          y2={frame.innerHeight * position}
        />
      ))}
    </Group>
  );
}

async function fetchOverviewChart(chart: OverviewChartKey) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "127.0.0.1:3010";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const response = await fetch(
    `${protocol}://${host}/api/overview/charts/${chart}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load ${chart} chart.`);
  }

  return (await response.json()) as OverviewChart;
}

function chartFrame() {
  return {
    innerWidth:
      CHART_VIEW.width - CHART_VIEW.padding.left - CHART_VIEW.padding.right,
    innerHeight:
      CHART_VIEW.height - CHART_VIEW.padding.top - CHART_VIEW.padding.bottom,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function sum<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((total, item) => total + getValue(item), 0);
}
