import { NextResponse } from "next/server";

import { applyRunTag } from "@/lib/observe/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as { tag: string; op: "add" | "remove" };
  try {
    return NextResponse.json(applyRunTag({ id, tag: body.tag, op: body.op }));
  } catch {
    return NextResponse.json({ error: "Tag rejected" }, { status: 500 });
  }
}
