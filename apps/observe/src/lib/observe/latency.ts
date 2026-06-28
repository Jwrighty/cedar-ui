export const endpointLatencies = {
  runs: 180,
  runDetail: 260,
  liveFeed: 400,
} as const;

export type ObserveEndpoint = keyof typeof endpointLatencies;

export interface LatencyOptions {
  endpoint: ObserveEndpoint;
  testMode?: boolean;
}

export async function waitForEndpointLatency({
  endpoint,
  testMode = isObserveTestMode(),
}: LatencyOptions) {
  const delay = testMode ? 1 : endpointLatencies[endpoint];
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function isObserveTestMode() {
  return process.env.OBSERVE_TEST_MODE === "1";
}
