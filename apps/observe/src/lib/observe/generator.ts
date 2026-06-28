import type {
  Environment,
  Message,
  ObserveCorpus,
  Run,
  RunStatus,
  Span,
  SpanType,
} from "./domain";

const DEFAULT_SEED = 20260224;
const DEFAULT_RUN_COUNT = 250;
const BASE_TIME_MS = Date.parse("2026-02-24T12:00:00.000Z");

const STATUSES = ["success", "success", "success", "running", "error"] as const;
const ENVIRONMENTS = ["production", "production", "staging"] as const;
const MODELS = ["gpt-5-mini", "gpt-5.1", "o4-mini", "claude-sonnet-4.5"] as const;
const AGENTS = ["Support triage", "Invoice analyst", "Deploy copilot", "QA scout"] as const;
const SPAN_TYPES = [
  "retrieval",
  "llm_call",
  "tool_call",
  "guardrail",
  "embedding",
] as const;

export interface CreateObserveCorpusOptions {
  seed?: number;
  runCount?: number;
}

export function createObserveCorpus(
  options: CreateObserveCorpusOptions = {},
): ObserveCorpus {
  const random = mulberry32(options.seed ?? DEFAULT_SEED);
  const runCount = options.runCount ?? DEFAULT_RUN_COUNT;
  const runs: Run[] = [];
  const spans: Span[] = [];
  const messages: Message[] = [];

  for (let index = 0; index < runCount; index += 1) {
    const id = `run_${String(index + 1).padStart(4, "0")}`;
    const status = pick(STATUSES, random) satisfies RunStatus;
    const environment = pick(ENVIRONMENTS, random) satisfies Environment;
    const model = pick(MODELS, random);
    const agentName = pick(AGENTS, random);
    const spanCount = 3 + Math.floor(random() * 5);
    const tokensIn = 600 + Math.floor(random() * 3400);
    const tokensOut = 180 + Math.floor(random() * 1800);
    const durationMs = status === "running" ? null : 900 + Math.floor(random() * 9000);
    const startedAt = new Date(BASE_TIME_MS - index * 5 * 60 * 1000).toISOString();
    const run: Run = {
      id,
      label: `${agentName} #${String(4000 + index)}`,
      agentName,
      model,
      status,
      environment,
      startedAt,
      durationMs,
      tokensIn,
      tokensOut,
      costUsd: roundCurrency((tokensIn * 0.0000008 + tokensOut * 0.0000024) * (1 + random())),
      spanCount,
      sessionId: `session_${Math.floor(index / 4) + 1}`,
    };

    runs.push(run);

    let offset = 0;
    for (let spanIndex = 0; spanIndex < spanCount; spanIndex += 1) {
      const type = pick(SPAN_TYPES, random) satisfies SpanType;
      const spanDuration = 120 + Math.floor(random() * 1600);
      const spanId = `${id}_span_${spanIndex + 1}`;
      const span: Span = {
        id: spanId,
        runId: id,
        parentSpanId: spanIndex === 0 ? null : `${id}_span_1`,
        type,
        name: spanName(type, spanIndex),
        startOffsetMs: offset,
        durationMs: spanDuration,
        status: spanIndex === spanCount - 1 ? status : "success",
        tokensIn: type === "llm_call" ? Math.floor(tokensIn / spanCount) : 0,
        tokensOut: type === "llm_call" ? Math.floor(tokensOut / spanCount) : 0,
        costUsd: type === "llm_call" ? roundCurrency(run.costUsd / spanCount) : 0,
        model: type === "llm_call" ? model : null,
      };

      spans.push(span);
      messages.push({
        spanId,
        role: "assistant",
        content: `${span.name} completed for ${run.label}.`,
      });
      offset += Math.floor(spanDuration * (0.5 + random() * 0.4));
    }
  }

  return { runs, spans, messages };
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<const T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)] ?? items[0]!;
}

function roundCurrency(value: number) {
  return Math.round(value * 10000) / 10000;
}

function spanName(type: SpanType, index: number) {
  const ordinal = index + 1;
  switch (type) {
    case "llm_call":
      return `Model call ${ordinal}`;
    case "tool_call":
      return `Tool execution ${ordinal}`;
    case "retrieval":
      return `Context retrieval ${ordinal}`;
    case "embedding":
      return `Embedding lookup ${ordinal}`;
    case "guardrail":
      return `Policy guardrail ${ordinal}`;
  }
}
