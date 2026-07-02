import Link from "next/link";
import { Suspense, type CSSProperties } from "react";

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Skeleton,
  Text,
} from "@jwrighty/cedar-react";

import { runTracePayload } from "@/lib/observe/api";
import type { Run } from "@/lib/observe/domain";

import { RunTraceView } from "./run-trace";

interface TracePageContentProps {
  run: Run;
  titleId: string;
  variant?: "page" | "overlay";
}

/**
 * Trace identity + summary, rendered synchronously from the run so the
 * shared-element morph starts immediately. The span waterfall is streamed in
 * behind a Suspense boundary — it must never gate the transition, otherwise the
 * morph freezes on the captured old snapshot while the payload loads.
 */
export function TracePageContent({
  run,
  titleId,
  variant = "page",
}: TracePageContentProps) {
  return (
    <section
      className={
        variant === "overlay" ? "trace-page trace-page--overlay" : "trace-page"
      }
      aria-labelledby={titleId}
    >
      {variant === "page" ? (
        <Link className="trace-back-link" href="/">
          Overview
        </Link>
      ) : null}

      <header className="trace-hero" data-status={run.status}>
        <div className="trace-identity">
          <div>
            <Text className="observe-kicker" size="sm" tone="muted">
              Trace detail
            </Text>
            <Heading
              id={titleId}
              className="trace-identity__title"
              level={2}
              size="xl"
            >
              {run.label}
            </Heading>
            <Text tone="muted">
              {run.agentName} · {run.model} · {run.id}
            </Text>
          </div>

          <Badge status={run.status}>{run.status}</Badge>
        </div>
      </header>

      <dl className="trace-run-facts" aria-label="Run summary">
        <div>
          <dt>Started</dt>
          <dd>{formatStartedAt(run.startedAt)}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>
            {run.durationMs === null
              ? "running"
              : formatDuration(run.durationMs)}
          </dd>
        </div>
        <div>
          <dt>Spans</dt>
          <dd>{run.spanCount}</dd>
        </div>
        <div>
          <dt>Tokens</dt>
          <dd>
            {run.tokensIn.toLocaleString("en-US")} in /{" "}
            {run.tokensOut.toLocaleString("en-US")} out
          </dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>${run.costUsd.toFixed(4)}</dd>
        </div>
      </dl>

      <Suspense fallback={<TraceLayoutSkeleton spanCount={run.spanCount} />}>
        <TraceWaterfallSection id={run.id} />
      </Suspense>
    </section>
  );
}

/**
 * Placeholder for the streamed waterfall that mirrors the real `.trace-layout`
 * structure — same cards, header, axis, and one fixed-height row per span (the
 * count is known from the run summary). Because the row heights are fixed, the
 * reserved space matches the loaded waterfall exactly, so nothing shifts when
 * `RunTraceView` streams in.
 */
function TraceLayoutSkeleton({ spanCount }: { spanCount: number }) {
  const rows = Math.max(spanCount, 1);

  return (
    <div className="trace-layout" aria-hidden="true">
      <Card className="trace-waterfall-card">
        <CardHeader className="trace-card-header">
          <div>
            <Text className="observe-kicker" size="sm" tone="muted">
              Waterfall
            </Text>
            <Heading level={2} size="md">
              Execution timeline
            </Heading>
          </div>
        </CardHeader>
        <CardBody className="trace-waterfall-body">
          <div className="trace-timeline-axis">
            <span>0ms</span>
            <span />
            <span />
          </div>
          <div className="trace-waterfall">
            {Array.from({ length: rows }, (_, index) => (
              <div className="trace-span-row" key={index}>
                <Skeleton shape="text" className="trace-skeleton-span-label" />
                <Skeleton
                  shape="rounded"
                  className="trace-skeleton-span-bar"
                  style={
                    {
                      "--trace-skeleton-offset": `${(index % 4) * 14}%`,
                      "--trace-skeleton-width": `${38 + ((index * 17) % 45)}%`,
                    } as CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="trace-detail-card trace-skeleton-detail">
        <CardHeader className="trace-card-header">
          <div>
            <Text className="observe-kicker" size="sm" tone="muted">
              Span detail
            </Text>
            <Skeleton shape="text" className="trace-skeleton-detail-title" />
          </div>
        </CardHeader>
        <CardBody>
          <div className="trace-skeleton-lines">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton shape="text" key={index} />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

async function TraceWaterfallSection({ id }: { id: string }) {
  const trace = await runTracePayload({ id });

  if (!trace) {
    return null;
  }

  return <RunTraceView trace={trace} />;
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
