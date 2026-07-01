"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import type { Environment, RunStatus } from "@/lib/observe/domain";
import {
  DEFAULT_SORT,
  parseRunsQuery,
  serializeSort,
  type RunSortField,
  type RunsQuery,
  type SortDir,
} from "@/lib/observe/runs-query";

export interface RunsFilters {
  status: RunStatus | null;
  model: string | null;
  environment: Environment | null;
  from: string | null;
  to: string | null;
}

const FILTER_TO_PARAM: Record<keyof RunsFilters, string> = {
  status: "status",
  model: "model",
  environment: "env",
  from: "from",
  to: "to",
};

/** Canonical query string for fetch URL + react-query key. Omits defaults. */
export function runsQueryString(query: RunsQuery): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.model) params.set("model", query.model);
  if (query.environment) params.set("env", query.environment);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (
    query.sortField !== DEFAULT_SORT.field ||
    query.sortDir !== DEFAULT_SORT.dir
  ) {
    params.set("sort", serializeSort(query.sortField, query.sortDir));
  }
  return params.toString();
}

export function useRunsSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const query = useMemo(
    () => parseRunsQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const push = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    (key: keyof RunsFilters, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      const param = FILTER_TO_PARAM[key];
      if (value === null || value === "") next.delete(param);
      else next.set(param, value);
      push(next);
    },
    [push, searchParams],
  );

  const toggleSort = useCallback(
    (field: RunSortField) => {
      const next = new URLSearchParams(searchParams.toString());
      // First click on a new field → desc; clicking the active field flips dir.
      const dir: SortDir =
        query.sortField === field && query.sortDir === "desc" ? "asc" : "desc";
      if (field === DEFAULT_SORT.field && dir === DEFAULT_SORT.dir) {
        next.delete("sort");
      } else {
        next.set("sort", serializeSort(field, dir));
      }
      push(next);
    },
    [push, query.sortDir, query.sortField, searchParams],
  );

  const reset = useCallback(() => {
    startTransition(() => router.push(pathname));
  }, [pathname, router]);

  const filters: RunsFilters = {
    status: query.status,
    model: query.model,
    environment: query.environment,
    from: query.from,
    to: query.to,
  };

  const hasActiveFilters =
    filters.status !== null ||
    filters.model !== null ||
    filters.environment !== null ||
    filters.from !== null ||
    filters.to !== null;

  return { query, filters, setFilter, toggleSort, reset, hasActiveFilters };
}
