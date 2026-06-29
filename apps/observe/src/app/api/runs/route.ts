import { NextResponse } from "next/server";

import { listRunsPayload } from "@/lib/observe/api";
import {
  isObserveTestMode,
  parseSlowMoMultiplier,
} from "@/lib/observe/latency";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const payload = await listRunsPayload({
    cursor: url.searchParams.get("cursor"),
    limit: Number(url.searchParams.get("limit") ?? 10),
    testMode: url.searchParams.get("testMode") === "1" || isObserveTestMode(),
    slowMoMultiplier: parseSlowMoMultiplier(url.searchParams.get("slowMo")),
  });

  return NextResponse.json(payload);
}
