import { NextResponse } from "next/server";

import { listRunsPayload } from "@/lib/observe/api";
import {
  isObserveTestMode,
  parseSlowMoMultiplier,
} from "@/lib/observe/latency";
import { parseRunsQuery } from "@/lib/observe/runs-query";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = parseRunsQuery(url.searchParams);
  const payload = await listRunsPayload({
    cursor: url.searchParams.get("cursor"),
    limit: Number(url.searchParams.get("limit") ?? 10),
    status: query.status,
    model: query.model,
    environment: query.environment,
    from: query.from,
    to: query.to,
    sortField: query.sortField,
    sortDir: query.sortDir,
    testMode: url.searchParams.get("testMode") === "1" || isObserveTestMode(),
    slowMoMultiplier: parseSlowMoMultiplier(url.searchParams.get("slowMo")),
  });

  return NextResponse.json(payload);
}
