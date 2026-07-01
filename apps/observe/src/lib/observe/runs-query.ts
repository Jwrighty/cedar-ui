import type { Environment, RunStatus } from "./domain";

export type RunSortField =
  | "time"
  | "label"
  | "model"
  | "status"
  | "tokens"
  | "cost"
  | "latency";

export type SortDir = "asc" | "desc";

export interface RunsQuery {
  status: RunStatus | null;
  model: string | null;
  environment: Environment | null;
  from: string | null;
  to: string | null;
  sortField: RunSortField;
  sortDir: SortDir;
}

export const DEFAULT_SORT: { field: RunSortField; dir: SortDir } = {
  field: "time",
  dir: "desc",
};

const SORT_FIELDS: RunSortField[] = [
  "time",
  "label",
  "model",
  "status",
  "tokens",
  "cost",
  "latency",
];
const STATUSES: RunStatus[] = ["running", "success", "error"];
const ENVIRONMENTS: Environment[] = ["production", "staging"];

function oneOf<T extends string>(value: string | null, allowed: T[]): T | null {
  return value !== null && (allowed as string[]).includes(value)
    ? (value as T)
    : null;
}

export function serializeSort(field: RunSortField, dir: SortDir): string {
  return `${field}:${dir}`;
}

export function parseRunsQuery(params: URLSearchParams): RunsQuery {
  const [rawField, rawDir] = (params.get("sort") ?? "").split(":");
  const sortField =
    oneOf<RunSortField>(rawField ?? null, SORT_FIELDS) ?? DEFAULT_SORT.field;
  const sortDir: SortDir =
    rawDir === "asc" || rawDir === "desc" ? rawDir : DEFAULT_SORT.dir;

  return {
    status: oneOf<RunStatus>(params.get("status"), STATUSES),
    model: params.get("model"),
    environment: oneOf<Environment>(params.get("env"), ENVIRONMENTS),
    from: params.get("from"),
    to: params.get("to"),
    sortField,
    sortDir,
  };
}
