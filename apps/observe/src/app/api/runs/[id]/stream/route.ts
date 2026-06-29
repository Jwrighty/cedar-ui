import { createTraceStreamEvents, runTracePayload } from "@/lib/observe/api";
import { isObserveTestMode } from "@/lib/observe/latency";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const url = new URL(request.url);
  const { id } = await context.params;
  const testMode =
    url.searchParams.get("testMode") === "1" || isObserveTestMode();
  const trace = await runTracePayload({ id, testMode });

  if (!trace) {
    return new Response("Run not found.", { status: 404 });
  }

  const encoder = new TextEncoder();
  const events = createTraceStreamEvents(trace);

  const stream = new ReadableStream({
    async start(controller) {
      for (const event of events) {
        if (request.signal.aborted) {
          break;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
        await wait(testMode ? 5 : event.type === "token" ? 45 : 220);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
