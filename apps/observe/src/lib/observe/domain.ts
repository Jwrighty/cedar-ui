export type RunStatus = "running" | "success" | "error";
export type Environment = "production" | "staging";
export type SpanType =
  | "llm_call"
  | "tool_call"
  | "retrieval"
  | "embedding"
  | "guardrail";

export interface Run {
  id: string;
  label: string;
  agentName: string;
  model: string;
  status: RunStatus;
  environment: Environment;
  startedAt: string;
  durationMs: number | null;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  spanCount: number;
  sessionId: string;
}

export interface Span {
  id: string;
  runId: string;
  parentSpanId: string | null;
  type: SpanType;
  name: string;
  startOffsetMs: number;
  durationMs: number;
  status: RunStatus;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  model: string | null;
}

export interface Message {
  spanId: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ObserveCorpus {
  runs: Run[];
  spans: Span[];
  messages: Message[];
}

export interface RunTrace {
  run: Run;
  spans: Span[];
  messages: Message[];
}

export type TraceStreamEvent =
  | {
      type: "span";
      spanId: string;
    }
  | {
      type: "token";
      spanId: string;
      token: string;
    }
  | {
      type: "complete";
      result: string;
    };

export type OverviewMetricKey =
  | "runs"
  | "successRate"
  | "totalCost"
  | "p95Latency";

export interface OverviewMetric {
  key: OverviewMetricKey;
  label: string;
  value: number;
  delta: {
    direction: "positive" | "negative" | "neutral";
    value: number;
    unit: "percent";
  };
  sparkline: number[];
}
