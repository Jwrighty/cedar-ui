import { NextResponse } from "next/server";

import { overviewMetricPayload } from "@/lib/observe/api";
import type { OverviewMetricKey } from "@/lib/observe/domain";
import {
  isObserveTestMode,
  parseSlowMoMultiplier,
} from "@/lib/observe/latency";

const metricKeys = new Set<OverviewMetricKey>([
  "runs",
  "successRate",
  "totalCost",
  "p95Latency",
]);

export async function GET(
  request: Request,
  context: { params: Promise<{ metric: string }> },
) {
  const url = new URL(request.url);
  const { metric } = await context.params;

  if (!isOverviewMetricKey(metric)) {
    return NextResponse.json({ error: "Unknown metric." }, { status: 404 });
  }

  try {
    return NextResponse.json(
      await overviewMetricPayload({
        metric,
        failMetric: asOverviewMetricKey(url.searchParams.get("failMetric")),
        testMode:
          url.searchParams.get("testMode") === "1" || isObserveTestMode(),
        slowMoMultiplier: parseSlowMoMultiplier(url.searchParams.get("slowMo")),
      }),
    );
  } catch {
    return NextResponse.json(
      { error: `Unable to load ${metric} metric.` },
      { status: 500 },
    );
  }
}

function asOverviewMetricKey(value: string | null) {
  return value && isOverviewMetricKey(value) ? value : null;
}

function isOverviewMetricKey(value: string): value is OverviewMetricKey {
  return metricKeys.has(value as OverviewMetricKey);
}
