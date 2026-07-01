import { NextResponse } from "next/server";

import { runsFacets } from "@/lib/observe/api";

export function GET() {
  return NextResponse.json(runsFacets());
}
