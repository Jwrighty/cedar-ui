import { Suspense } from "react";

import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";

import { Heading, Skeleton, Text } from "@jwrighty/cedar-react";

import type {
  CostByModelChart,
  LatencyDistributionChart,
  OverviewChart,
  OverviewChartKey,
  RunsOverTimeChart,
} from "@/lib/observe/domain";
import { overviewChartPayload } from "@/lib/observe/api";
import type { SlowMoMultiplier } from "@/lib/observe/latency";

const AREA_VIEW = {
  width: 720,
  height: 220,
  padding: {
    top: 12,
    right: 4,
    bottom: 12,
    left: 4,
  },
} as const;

const chartMeta: Record<
  OverviewChartKey,
  { title: string; description: string }
> = {
  "runs-over-time": {
    title: "Runs over time",
    description: "Run volume across the current 12-hour operating window.",
  },
  "cost-by-model": {
    title: "Cost by model",
    description: "Spend distribution across the active model mix.",
  },
  "latency-distribution": {
    title: "Latency distribution",
    description: "Completed run latency clustered into response-time bands.",
  },
};

const secondaryCharts: OverviewChartKey[] = [
  "cost-by-model",
  "latency-distribution",
];

export function OverviewRunsChart({
  testMode,
  slowMoMultiplier,
}: {
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}) {
  return (
    <OverviewChartShell
      chart="runs-over-time"
      testMode={testMode}
      slowMoMultiplier={slowMoMultiplier}
    />
  );
}

export function OverviewCharts({
  testMode,
  slowMoMultiplier,
}: {
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}) {
  return (
    <section className="overview-charts" aria-label="Overview charts">
      {secondaryCharts.map((chart) => (
        <OverviewChartShell
          key={chart}
          chart={chart}
          testMode={testMode}
          slowMoMultiplier={slowMoMultiplier}
        />
      ))}
    </section>
  );
}

// The header is known up front (title/description never depend on the
// fetched payload), so it renders once, outside the Suspense boundary. Only
// the plot re-renders when data resolves — otherwise Suspense would unmount
// and remount the whole card, replaying its entrance animation over a header
// that hadn't actually changed and producing a visible flash.
function OverviewChartShell({
  chart,
  testMode,
  slowMoMultiplier,
}: {
  chart: OverviewChartKey;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}) {
  const { title, description } = chartMeta[chart];

  return (
    <article
      className={`overview-chart-card overview-chart-card--${chart}`}
      data-testid={`overview-chart-${chart}`}
    >
      <ChartHeader title={title} description={description} />
      <Suspense fallback={<OverviewChartBodySkeleton chart={chart} />}>
        <OverviewChartBody
          chart={chart}
          testMode={testMode}
          slowMoMultiplier={slowMoMultiplier}
        />
      </Suspense>
    </article>
  );
}

async function OverviewChartBody({
  chart,
  testMode,
  slowMoMultiplier,
}: {
  chart: OverviewChartKey;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}) {
  const payload = await fetchOverviewChart(chart, {
    testMode,
    slowMoMultiplier,
  });

  return renderChart(payload);
}

function OverviewChartBodySkeleton({ chart }: { chart: OverviewChartKey }) {
  return (
    <>
      <span className="sr-only">Loading {chartMeta[chart].title}</span>
      <Skeleton
        className="overview-chart-skeleton__plot"
        shape="rounded"
        data-testid={`overview-chart-skeleton-${chart}`}
      />
      <div className="overview-chart-skeleton__legend" aria-hidden="true">
        <Skeleton shape="text" />
        <Skeleton shape="text" />
        <Skeleton shape="text" />
      </div>
    </>
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
  const frame = areaFrame();
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
        viewBox={`0 0 ${AREA_VIEW.width} ${AREA_VIEW.height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${chart.title}: ${chart.summary}`}
      >
        <AreaGrid frame={frame} />
        <Group
          className="overview-chart__draw overview-chart__draw--sweep"
          left={AREA_VIEW.padding.left}
          top={AREA_VIEW.padding.top}
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
            vectorEffect="non-scaling-stroke"
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
  const maxCost = Math.max(...chart.rows.map((row) => row.costUsd)) || 1;

  return (
    <figure className="overview-chart-figure">
      <ul
        className="cost-bars"
        role="img"
        aria-label={`${chart.title}: ${chart.summary}`}
      >
        {chart.rows.map((row, index) => (
          <li key={row.model} className="cost-bar">
            <div className="cost-bar__head">
              <span className="cost-bar__label">{row.model}</span>
              <span className="cost-bar__value">
                {formatCurrency(row.costUsd)}
              </span>
            </div>
            <span className="cost-bar__track">
              <span
                className="cost-bar__fill"
                style={{
                  inlineSize: `${(row.costUsd / maxCost) * 100}%`,
                  animationDelay: `${index * 40}ms`,
                }}
              />
            </span>
          </li>
        ))}
      </ul>
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
  const maxCount = Math.max(...chart.buckets.map((bucket) => bucket.count), 1);

  return (
    <figure className="overview-chart-figure">
      <div
        className="latency-bars"
        role="img"
        aria-label={`${chart.title}: ${chart.summary}`}
      >
        {chart.buckets.map((bucket, index) => (
          <div key={bucket.label} className="latency-bar">
            <span className="latency-bar__count">{bucket.count}</span>
            <span className="latency-bar__track">
              <span
                className="latency-bar__fill"
                style={{
                  blockSize: `${Math.max((bucket.count / maxCount) * 100, 3)}%`,
                  animationDelay: `${index * 40}ms`,
                }}
              />
            </span>
            <span className="latency-bar__label">{bucket.label}</span>
          </div>
        ))}
      </div>
      <figcaption className="overview-chart-legend">
        {sum(chart.buckets, (bucket) => bucket.count)} completed runs
      </figcaption>
    </figure>
  );
}

function AreaGrid({ frame }: { frame: ReturnType<typeof areaFrame> }) {
  const yLines = [0, 0.5, 1];

  return (
    <Group
      className="overview-chart__grid"
      left={AREA_VIEW.padding.left}
      top={AREA_VIEW.padding.top}
    >
      {yLines.map((position) => (
        <line
          key={position}
          x1={0}
          x2={frame.innerWidth}
          y1={frame.innerHeight * position}
          y2={frame.innerHeight * position}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </Group>
  );
}

async function fetchOverviewChart(
  chart: OverviewChartKey,
  {
    testMode,
    slowMoMultiplier = 1,
  }: { testMode?: boolean; slowMoMultiplier?: SlowMoMultiplier } = {},
) {
  // Call the data layer directly rather than round-tripping through our own
  // /api route. A server-side fetch to the deployment's public host fails
  // behind Vercel preview Deployment Protection (the request is unauthenticated),
  // crashing the server render; this also drops a needless network hop.
  return overviewChartPayload({ chart, testMode, slowMoMultiplier });
}

function areaFrame() {
  return {
    innerWidth:
      AREA_VIEW.width - AREA_VIEW.padding.left - AREA_VIEW.padding.right,
    innerHeight:
      AREA_VIEW.height - AREA_VIEW.padding.top - AREA_VIEW.padding.bottom,
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
