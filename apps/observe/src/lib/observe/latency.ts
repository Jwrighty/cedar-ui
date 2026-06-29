export const endpointLatencies = {
  overviewMetricRuns: 40,
  overviewMetricSuccessRate: 70,
  overviewMetricTotalCost: 100,
  overviewMetricP95Latency: 130,
  overviewChartRunsOverTime: 170,
  overviewChartCostByModel: 210,
  overviewChartLatencyDistribution: 250,
  overviewRecentRuns: 290,
  runs: 180,
  runDetail: 260,
  liveFeed: 400,
} as const;

export type ObserveEndpoint = keyof typeof endpointLatencies;

const supportedSlowMoMultipliers = [1, 2, 4] as const;

export type SlowMoMultiplier = (typeof supportedSlowMoMultipliers)[number];

const testEndpointLatencies: Partial<Record<ObserveEndpoint, number>> = {
  overviewMetricRuns: 500,
  overviewMetricSuccessRate: 1000,
  overviewMetricTotalCost: 1500,
  overviewMetricP95Latency: 2000,
  overviewChartRunsOverTime: 2400,
  overviewChartCostByModel: 2800,
  overviewChartLatencyDistribution: 3200,
  overviewRecentRuns: 3600,
};

export interface LatencyOptions {
  endpoint: ObserveEndpoint;
  testMode?: boolean;
  slowMoMultiplier?: SlowMoMultiplier;
}

export async function waitForEndpointLatency({
  endpoint,
  testMode = isObserveTestMode(),
  slowMoMultiplier = 1,
}: LatencyOptions) {
  const baseDelay = testMode
    ? (testEndpointLatencies[endpoint] ?? 1)
    : endpointLatencies[endpoint];
  const delay = baseDelay * slowMoMultiplier;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function isObserveTestMode() {
  return process.env.OBSERVE_TEST_MODE === "1";
}

export function parseSlowMoMultiplier(
  value: string | string[] | null | undefined,
): SlowMoMultiplier {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const multiplier = Number(firstValue);

  return supportedSlowMoMultipliers.includes(multiplier as SlowMoMultiplier)
    ? (multiplier as SlowMoMultiplier)
    : 1;
}
