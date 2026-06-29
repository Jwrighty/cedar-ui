export const endpointLatencies = {
  overviewMetricRuns: 40,
  overviewMetricSuccessRate: 70,
  overviewMetricTotalCost: 100,
  overviewMetricP95Latency: 130,
  overviewChartRunsOverTime: 170,
  overviewChartCostByModel: 210,
  overviewChartLatencyDistribution: 250,
  runs: 180,
  runDetail: 260,
  liveFeed: 400,
} as const;

export type ObserveEndpoint = keyof typeof endpointLatencies;

const testEndpointLatencies: Partial<Record<ObserveEndpoint, number>> = {
  overviewMetricRuns: 500,
  overviewMetricSuccessRate: 1000,
  overviewMetricTotalCost: 1500,
  overviewMetricP95Latency: 2000,
  overviewChartRunsOverTime: 2400,
  overviewChartCostByModel: 2800,
  overviewChartLatencyDistribution: 3200,
};

export interface LatencyOptions {
  endpoint: ObserveEndpoint;
  testMode?: boolean;
}

export async function waitForEndpointLatency({
  endpoint,
  testMode = isObserveTestMode(),
}: LatencyOptions) {
  const delay = testMode
    ? (testEndpointLatencies[endpoint] ?? 1)
    : endpointLatencies[endpoint];
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function isObserveTestMode() {
  return process.env.OBSERVE_TEST_MODE === "1";
}
