import { http, HttpResponse, delay } from "msw";

import { listRunsPayload, runsFacets } from "@/lib/observe/api";
import { parseRunsQuery } from "@/lib/observe/runs-query";

export const handlers = [
  http.get("*/api/runs/facets", async () => {
    await delay(1);
    return HttpResponse.json(runsFacets());
  }),
  http.get("*/api/runs", async ({ request }) => {
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
      testMode: true,
    });

    await delay(1);
    return HttpResponse.json(payload);
  }),
];
