import { appendedRuns } from "@/lib/observe/api";
import { isObserveTestMode } from "@/lib/observe/latency";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const testMode =
    new URL(request.url).searchParams.get("testMode") === "1" ||
    isObserveTestMode();
  const intervalMs = testMode ? 150 : 4000;
  const runs = appendedRuns(12);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let i = 0;
      const timer = setInterval(() => {
        if (i >= runs.length) {
          clearInterval(timer);
          controller.close();
          return;
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(runs[i])}\n\n`),
        );
        i += 1;
      }, intervalMs);

      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
