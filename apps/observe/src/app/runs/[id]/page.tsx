import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Heading, Text } from "@jwrighty/cedar-react";

import { runTracePayload } from "@/lib/observe/api";

import { DashboardShell } from "../../dashboard-shell";
import { RunTraceView } from "./run-trace";

export const dynamic = "force-dynamic";

interface RunPageProps {
  params: Promise<{ id: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { id } = await params;
  const trace = await runTracePayload({ id });

  if (!trace) {
    notFound();
  }

  return (
    <DashboardShell>
      <section className="trace-page" aria-labelledby="trace-page-title">
        <Link className="trace-back-link" href="/">
          Overview
        </Link>

        <header className="trace-hero" data-status={trace.run.status}>
          <div>
            <Text className="observe-kicker" size="sm" tone="muted">
              Trace detail
            </Text>
            <Heading id="trace-page-title" level={2} size="xl">
              {trace.run.label}
            </Heading>
            <Text tone="muted">
              {trace.run.agentName} · {trace.run.model} · {trace.run.id}
            </Text>
          </div>

          <Badge status={trace.run.status}>{trace.run.status}</Badge>
        </header>

        <dl className="trace-run-facts" aria-label="Run summary">
          <div>
            <dt>Started</dt>
            <dd>{formatStartedAt(trace.run.startedAt)}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>
              {trace.run.durationMs === null
                ? "running"
                : formatDuration(trace.run.durationMs)}
            </dd>
          </div>
          <div>
            <dt>Spans</dt>
            <dd>{trace.spans.length}</dd>
          </div>
          <div>
            <dt>Tokens</dt>
            <dd>
              {trace.run.tokensIn.toLocaleString("en-US")} in /{" "}
              {trace.run.tokensOut.toLocaleString("en-US")} out
            </dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>${trace.run.costUsd.toFixed(4)}</dd>
          </div>
        </dl>

        <RunTraceView trace={trace} />
      </section>
    </DashboardShell>
  );
}

function formatStartedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatDuration(valueMs: number) {
  return valueMs >= 1000 ? `${(valueMs / 1000).toFixed(1)}s` : `${valueMs}ms`;
}
