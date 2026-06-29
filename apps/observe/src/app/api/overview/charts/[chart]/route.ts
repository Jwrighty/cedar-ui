import { NextResponse } from "next/server";

import { overviewChartPayload } from "@/lib/observe/api";
import type { OverviewChartKey } from "@/lib/observe/domain";
import {
  isObserveTestMode,
  parseSlowMoMultiplier,
} from "@/lib/observe/latency";

const chartKeys = new Set<OverviewChartKey>([
  "runs-over-time",
  "cost-by-model",
  "latency-distribution",
]);

export async function GET(
  request: Request,
  context: { params: Promise<{ chart: string }> },
) {
  const url = new URL(request.url);
  const { chart } = await context.params;

  if (!isOverviewChartKey(chart)) {
    return NextResponse.json({ error: "Unknown chart." }, { status: 404 });
  }

  return NextResponse.json(
    await overviewChartPayload({
      chart,
      testMode: url.searchParams.get("testMode") === "1" || isObserveTestMode(),
      slowMoMultiplier: parseSlowMoMultiplier(url.searchParams.get("slowMo")),
    }),
  );
}

function isOverviewChartKey(value: string): value is OverviewChartKey {
  return chartKeys.has(value as OverviewChartKey);
}
