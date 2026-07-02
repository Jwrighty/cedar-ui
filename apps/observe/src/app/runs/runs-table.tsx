"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  Button,
  Heading,
  Skeleton,
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  Text,
} from "@jwrighty/cedar-react";

import type { Run } from "@/lib/observe/domain";
import { RUN_COLUMNS } from "./runs-columns";
import { TRACE_ORIGIN_ROW_STORAGE_KEY } from "./trace-transition";
import { useLiveRuns } from "./use-live-runs";
import { useTagRun } from "./use-tag-run";
import { runsQueryString, useRunsSearchParams } from "./use-runs-search-params";

interface RunsPage {
  runs: Run[];
  nextCursor: string | null;
  generatedAt: string;
}

const PAGE_SIZE = 25;

async function fetchRunsPage(
  qs: string,
  cursor: string | null,
): Promise<RunsPage> {
  const params = new URLSearchParams(qs);
  params.set("limit", String(PAGE_SIZE));
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/runs?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load runs (${res.status})`);
  return res.json();
}

export function RunsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { query, toggleSort, reset, hasActiveFilters } = useRunsSearchParams();
  const qs = runsQueryString(query);

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["runs", qs],
    queryFn: ({ pageParam }) => fetchRunsPage(qs, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const isDefaultView =
    !hasActiveFilters && query.sortField === "time" && query.sortDir === "desc";
  const { liveRuns, announcement, setLiveRuns } = useLiveRuns({
    enabled: isDefaultView,
  });
  const tagRun = useTagRun();

  function handleTag(id: string, tag: string, op: "add" | "remove") {
    const liveRun = liveRuns.find((r) => r.id === id);
    if (!liveRun) {
      tagRun.mutate({ id, tag, op });
      return;
    }
    // Live/SSE-sourced rows aren't in the react-query cache the mutation
    // patches, so mirror the optimistic update (and its rollback) here too.
    const prevTags = liveRun.tags;
    setLiveRuns((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              tags:
                op === "add"
                  ? Array.from(new Set([...r.tags, tag]))
                  : r.tags.filter((t) => t !== tag),
            }
          : r,
      ),
    );
    tagRun.mutate(
      { id, tag, op },
      {
        onError: () => {
          setLiveRuns((prev) =>
            prev.map((r) => (r.id === id ? { ...r, tags: prevTags } : r)),
          );
        },
      },
    );
  }

  const fetchedRuns = data?.pages.flatMap((p) => p.runs) ?? [];
  const seen = new Set(fetchedRuns.map((r) => r.id));
  const runs = [...liveRuns.filter((r) => !seen.has(r.id)), ...fetchedRuns];

  useEffect(() => {
    if (pathname !== "/runs") return;

    const runId = window.sessionStorage.getItem(TRACE_ORIGIN_ROW_STORAGE_KEY);
    if (!runId) return;

    window.sessionStorage.removeItem(TRACE_ORIGIN_ROW_STORAGE_KEY);
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-run-id="${cssEscape(runId)}"]`)
        ?.focus();
    });
  }, [pathname, runs.length]);

  // Infinite-scroll sentinel.
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, runs.length]);

  function openRun(id: string) {
    // Remember the origin row so focus can be restored to it when the overlay
    // closes; the overlay itself is the intercepting `/runs/[id]` modal route.
    window.sessionStorage.setItem(TRACE_ORIGIN_ROW_STORAGE_KEY, id);
    router.push(traceHref(id, searchParams));
  }

  return (
    <div className="runs-table-wrap" data-testid="runs-table">
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        data-testid="runs-live-announcer"
      >
        {announcement}
      </div>
      <Table density="compact" aria-label="Runs">
        <thead>
          <TableRow>
            {RUN_COLUMNS.map((col) => {
              const active = query.sortField === col.id;
              return (
                <TableHeaderCell
                  key={col.id}
                  scope="col"
                  isNumeric={col.isNumeric}
                  align={col.isNumeric ? "end" : "start"}
                  aria-sort={
                    active
                      ? query.sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    className="runs-sort-button"
                    data-active={active || undefined}
                    onClick={() => toggleSort(col.id)}
                  >
                    {col.header}
                    <span aria-hidden="true" className="runs-sort-indicator">
                      {active ? (query.sortDir === "asc" ? "↑" : "↓") : ""}
                    </span>
                  </button>
                </TableHeaderCell>
              );
            })}
            <TableHeaderCell scope="col">Tags</TableHeaderCell>
          </TableRow>
        </thead>
        <tbody>
          {isPending
            ? Array.from({ length: 10 }, (_, i) => (
                <TableRow key={`sk-${i}`} aria-hidden="true">
                  {RUN_COLUMNS.map((col) => (
                    <TableCell
                      key={col.id}
                      isNumeric={col.isNumeric}
                      align={col.isNumeric ? "end" : "start"}
                    >
                      <Skeleton shape="text" className="runs-skeleton-cell" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton shape="text" className="runs-skeleton-cell" />
                  </TableCell>
                </TableRow>
              ))
            : runs.map((run) => {
                return (
                  <TableRow
                    key={run.id}
                    isInteractive
                    data-run-id={run.id}
                    data-status={run.status}
                    tabIndex={0}
                    role="link"
                    aria-label={`Open trace for ${run.label}`}
                    className="runs-row runs-row--enter"
                    onClick={() => openRun(run.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRun(run.id);
                      }
                    }}
                  >
                    {RUN_COLUMNS.map((col) => (
                      <TableCell
                        key={col.id}
                        isNumeric={col.isNumeric}
                        align={col.isNumeric ? "end" : "start"}
                      >
                        {col.id === "label" ? (
                          <span className="runs-row-identity">
                            <span className="runs-row-identity__label">
                              {run.label}
                            </span>
                            <span className="runs-row-identity__meta">
                              {run.id} · {run.model} · {run.status}
                            </span>
                          </span>
                        ) : (
                          col.cell(run)
                        )}
                      </TableCell>
                    ))}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <span
                        className="runs-tags"
                        data-testid={`run-tags-${run.id}`}
                      >
                        {run.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="runs-tag"
                            onClick={() => handleTag(run.id, tag, "remove")}
                          >
                            {tag} ×
                          </button>
                        ))}
                        <button
                          type="button"
                          className="runs-tag runs-tag--add"
                          data-testid={`run-tag-add-${run.id}`}
                          onClick={() => handleTag(run.id, "flagged", "add")}
                        >
                          + flag
                        </button>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
          {hasNextPage ? <tr ref={sentinelRef} aria-hidden="true" /> : null}
        </tbody>
      </Table>

      {!isPending && !isError && runs.length === 0 ? (
        <div className="runs-empty" data-testid="runs-empty" role="status">
          <Heading level={2} size="sm">
            No runs match these filters
          </Heading>
          <Text tone="muted">
            Try widening the time range or clearing a filter to see more
            activity.
          </Text>
          {hasActiveFilters ? (
            <Button variant="secondary" onPress={reset}>
              Reset filters
            </Button>
          ) : null}
        </div>
      ) : null}

      {isError ? (
        <div className="runs-error" data-testid="runs-error" role="alert">
          <Text tone="muted">Could not load runs.</Text>
          <Button variant="secondary" onPress={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function cssEscape(value: string) {
  if (typeof CSS !== "undefined" && CSS.escape) {
    return CSS.escape(value);
  }

  return value.replace(/"/g, '\\"');
}

function traceHref(id: string, searchParams: { toString(): string }) {
  const queryString = searchParams.toString();
  return `/runs/${id}${queryString ? `?${queryString}` : ""}`;
}
