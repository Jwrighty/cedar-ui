"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tabs,
  Text,
  Tooltip,
} from "@jwrighty/cedar-react";

import type {
  Message,
  RunTrace,
  Span,
  TraceStreamEvent,
} from "@/lib/observe/domain";

interface RunTraceViewProps {
  trace: RunTrace;
}

export function RunTraceView({ trace }: RunTraceViewProps) {
  const searchParams = useSearchParams();
  const slowMo = searchParams.get("slowMo");
  const testMode = searchParams.get("testMode");
  const [revealedSpanIds, setRevealedSpanIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedSpanId, setSelectedSpanId] = useState(
    () => trace.spans[0]?.id ?? "",
  );
  const [streamedMessages, setStreamedMessages] = useState<
    Record<string, string>
  >({});
  const [settledResult, setSettledResult] = useState("");

  useEffect(() => {
    setRevealedSpanIds(new Set());
    setSelectedSpanId(trace.spans[0]?.id ?? "");
    setStreamedMessages({});
    setSettledResult("");

    const streamParams = new URLSearchParams();
    if (slowMo) streamParams.set("slowMo", slowMo);
    if (testMode) streamParams.set("testMode", testMode);
    const streamQuery = streamParams.toString();
    const source = new EventSource(
      `/api/runs/${encodeURIComponent(trace.run.id)}/stream${
        streamQuery ? `?${streamQuery}` : ""
      }`,
    );

    source.onmessage = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as TraceStreamEvent;

      if (payload.type === "span") {
        setRevealedSpanIds((current) => {
          const next = new Set(current);
          next.add(payload.spanId);
          return next;
        });
        return;
      }

      if (payload.type === "token") {
        setStreamedMessages((current) => ({
          ...current,
          [payload.spanId]: `${current[payload.spanId] ?? ""}${payload.token}`,
        }));
        return;
      }

      setSettledResult(payload.result);
      source.close();
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [slowMo, testMode, trace.run.id, trace.spans]);

  const spanDepths = useMemo(
    () => createSpanDepths(trace.spans),
    [trace.spans],
  );
  const timelineDuration = useMemo(
    () => getTimelineDuration(trace.spans),
    [trace.spans],
  );
  const selectedSpan =
    trace.spans.find((span) => span.id === selectedSpanId) ?? trace.spans[0];

  return (
    <div className="trace-layout">
      <Card
        className="trace-waterfall-card"
        role="region"
        aria-labelledby="trace-waterfall-title"
      >
        <CardHeader className="trace-card-header">
          <div>
            <Text className="observe-kicker" size="sm" tone="muted">
              Waterfall
            </Text>
            <Heading id="trace-waterfall-title" level={2} size="md">
              Execution timeline
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            {formatDuration(timelineDuration)}
          </Text>
        </CardHeader>
        <CardBody className="trace-waterfall-body">
          <div className="trace-timeline-axis" aria-hidden="true">
            <span>0ms</span>
            <span>{formatDuration(Math.round(timelineDuration / 2))}</span>
            <span>{formatDuration(timelineDuration)}</span>
          </div>

          <div className="trace-waterfall" data-testid="trace-waterfall">
            {trace.spans.map((span) => {
              const isVisible = revealedSpanIds.has(span.id) || settledResult;
              const isSelected = selectedSpan?.id === span.id;
              const left = (span.startOffsetMs / timelineDuration) * 100;
              const width = (span.durationMs / timelineDuration) * 100;

              return (
                <div
                  className="trace-span-row"
                  data-visible={isVisible ? "true" : "false"}
                  key={span.id}
                >
                  <Tooltip.Trigger delay={400}>
                    <Button
                      className="trace-span-label"
                      variant="ghost"
                      size="sm"
                      aria-pressed={isSelected}
                      onPress={() => setSelectedSpanId(span.id)}
                      style={
                        {
                          "--trace-depth": spanDepths.get(span.id) ?? 0,
                        } as CSSProperties
                      }
                    >
                      <span className="trace-span-type" aria-hidden="true" />
                      <span>{span.name}</span>
                    </Button>
                    <Tooltip placement="right">
                      {span.type.replace("_", " ")} ·{" "}
                      {formatDuration(span.durationMs)}
                    </Tooltip>
                  </Tooltip.Trigger>
                  <button
                    className="trace-span-bar"
                    type="button"
                    aria-label={`${span.name}, ${formatDuration(span.durationMs)}`}
                    aria-pressed={isSelected}
                    data-status={span.status}
                    onClick={() => setSelectedSpanId(span.id)}
                    style={
                      {
                        "--trace-left": `${left}%`,
                        "--trace-width": `${Math.max(width, 3)}%`,
                      } as CSSProperties
                    }
                  />
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <TraceSpanPanel
        messages={trace.messages}
        selectedSpan={selectedSpan}
        streamedMessages={streamedMessages}
        settledResult={settledResult}
      />
    </div>
  );
}

function TraceSpanPanel({
  messages,
  selectedSpan,
  streamedMessages,
  settledResult,
}: {
  messages: Message[];
  selectedSpan: Span | undefined;
  streamedMessages: Record<string, string>;
  settledResult: string;
}) {
  const selectedMessages = selectedSpan
    ? messages.filter((message) => message.spanId === selectedSpan.id)
    : [];

  return (
    <Card
      className="trace-detail-card"
      role="region"
      aria-labelledby="trace-detail-title"
      data-testid="trace-detail-panel"
    >
      <CardHeader className="trace-card-header">
        <div>
          <Text className="observe-kicker" size="sm" tone="muted">
            Span detail
          </Text>
          <Heading id="trace-detail-title" level={2} size="md">
            {selectedSpan?.name ?? "No span selected"}
          </Heading>
        </div>
        {selectedSpan ? (
          <Badge status={selectedSpan.status}>{selectedSpan.status}</Badge>
        ) : null}
      </CardHeader>
      <CardBody>
        <Tabs.Root defaultSelectedKey="messages">
          <Tabs.List aria-label="Trace detail sections">
            <Tabs.Tab id="messages">Messages</Tabs.Tab>
            <Tabs.Tab id="metadata">Metadata</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="messages">
            <div className="trace-messages">
              {selectedMessages.map((message) => {
                const streamedContent = streamedMessages[message.spanId];
                const content =
                  message.role === "assistant"
                    ? (streamedContent ??
                      (settledResult ? message.content : "Waiting for output…"))
                    : message.content;

                return (
                  <article className="trace-message" key={message.content}>
                    <Text className="trace-message__role" size="sm">
                      {message.role}
                    </Text>
                    <p>{content}</p>
                  </article>
                );
              })}
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="metadata">
            {selectedSpan ? (
              <dl className="trace-span-metadata">
                <div>
                  <dt>Type</dt>
                  <dd>{selectedSpan.type.replace("_", " ")}</dd>
                </div>
                <div>
                  <dt>Start</dt>
                  <dd>{formatDuration(selectedSpan.startOffsetMs)}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{formatDuration(selectedSpan.durationMs)}</dd>
                </div>
                <div>
                  <dt>Tokens</dt>
                  <dd>
                    {selectedSpan.tokensIn.toLocaleString("en-US")} in /{" "}
                    {selectedSpan.tokensOut.toLocaleString("en-US")} out
                  </dd>
                </div>
                <div>
                  <dt>Cost</dt>
                  <dd>${selectedSpan.costUsd.toFixed(4)}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{selectedSpan.model ?? "n/a"}</dd>
                </div>
              </dl>
            ) : null}
          </Tabs.Panel>
        </Tabs.Root>
        <p className="trace-settled-result" aria-live="polite">
          {settledResult}
        </p>
      </CardBody>
    </Card>
  );
}

function createSpanDepths(spans: Span[]) {
  const byId = new Map(spans.map((span) => [span.id, span]));
  const depths = new Map<string, number>();

  function depthFor(span: Span, visited = new Set<string>()): number {
    if (depths.has(span.id)) {
      return depths.get(span.id)!;
    }

    if (!span.parentSpanId || visited.has(span.parentSpanId)) {
      depths.set(span.id, 0);
      return 0;
    }

    visited.add(span.id);
    const parent = byId.get(span.parentSpanId);
    const depth = parent ? depthFor(parent, visited) + 1 : 0;
    depths.set(span.id, depth);
    return depth;
  }

  for (const span of spans) {
    depthFor(span);
  }

  return depths;
}

function getTimelineDuration(spans: Span[]) {
  return Math.max(
    1,
    ...spans.map((span) => span.startOffsetMs + span.durationMs),
  );
}

function formatDuration(valueMs: number) {
  return valueMs >= 1000 ? `${(valueMs / 1000).toFixed(1)}s` : `${valueMs}ms`;
}
