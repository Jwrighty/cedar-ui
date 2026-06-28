import { http, HttpResponse, delay } from "msw";

import { listRunsPayload } from "@/lib/observe/api";

export const handlers = [
  http.get("*/api/runs", async ({ request }) => {
    const url = new URL(request.url);
    const payload = await listRunsPayload({
      cursor: url.searchParams.get("cursor"),
      limit: Number(url.searchParams.get("limit") ?? 10),
      testMode: true,
    });

    await delay(1);
    return HttpResponse.json(payload);
  }),
];
