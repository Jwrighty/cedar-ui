import { headers } from "next/headers";

import { Heading, Text } from "@jwrighty/cedar-react";

import { MotionStatus } from "./motion-status";

export const dynamic = "force-dynamic";

interface RunsResponse {
  runs: Array<{
    id: string;
    label: string;
    model: string;
    status: "running" | "success" | "error";
    costUsd: number;
    durationMs: number | null;
  }>;
}

export default async function Page() {
  const run = await fetchFirstRun();

  return (
    <main className="observe-page">
      <section className="observe-panel" aria-labelledby="observe-title">
        <Text className="observe-kicker" size="sm" tone="muted">
          Cedar observe
        </Text>
        <Heading id="observe-title" level={1} size="xl">
          Agent run telemetry
        </Heading>
        <Text tone="muted">
          Seeded data is flowing through the mock backend and into a server
          component.
        </Text>

        <article className="run-card" data-status={run.status}>
          <div>
            <Text size="sm" tone="muted">
              Latest run
            </Text>
            <Heading level={2} size="md">
              {run.label}
            </Heading>
          </div>
          <dl className="run-facts">
            <div>
              <dt>Status</dt>
              <dd>{run.status}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{run.model}</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd>${run.costUsd.toFixed(4)}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>
                {run.durationMs === null ? "running" : `${run.durationMs}ms`}
              </dd>
            </div>
          </dl>
        </article>

        <MotionStatus>
          Rendered from `/api/runs` with deterministic seed data.
        </MotionStatus>
      </section>
    </main>
  );
}

async function fetchFirstRun() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "127.0.0.1:3010";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const response = await fetch(`${protocol}://${host}/api/runs?limit=1`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load observe runs.");
  }

  const payload = (await response.json()) as RunsResponse;
  const run = payload.runs[0];
  if (!run) {
    throw new Error("Observe generated no runs.");
  }

  return run;
}
