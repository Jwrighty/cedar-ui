import { NextResponse } from "next/server";

import { runTracePayload } from "@/lib/observe/api";
import { isObserveTestMode } from "@/lib/observe/latency";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const url = new URL(request.url);
  const { id } = await context.params;
  const trace = await runTracePayload({
    id,
    testMode: url.searchParams.get("testMode") === "1" || isObserveTestMode(),
  });

  if (!trace) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  return NextResponse.json(trace);
}
