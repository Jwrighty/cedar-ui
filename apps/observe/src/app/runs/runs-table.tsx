"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import {
  runsQueryString,
  useRunsSearchParams,
} from "./use-runs-search-params";

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

  const runs = data?.pages.flatMap((p) => p.runs) ?? [];

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
    router.push(`/runs/${id}`);
  }

  return (
    <div className="runs-table-wrap" data-testid="runs-table">
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
                    active ? (query.sortDir === "asc" ? "ascending" : "descending") : "none"
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
          </TableRow>
        </thead>
        <tbody>
          {isPending
            ? Array.from({ length: 10 }, (_, i) => (
                <TableRow key={`sk-${i}`} aria-hidden="true">
                  {RUN_COLUMNS.map((col) => (
                    <TableCell key={col.id} isNumeric={col.isNumeric} align={col.isNumeric ? "end" : "start"}>
                      <Skeleton shape="text" className="runs-skeleton-cell" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : runs.map((run) => (
                <TableRow
                  key={run.id}
                  isInteractive
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
                    <TableCell key={col.id} isNumeric={col.isNumeric} align={col.isNumeric ? "end" : "start"}>
                      {col.cell(run)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          {hasNextPage ? <tr ref={sentinelRef} aria-hidden="true" /> : null}
        </tbody>
      </Table>

      {!isPending && !isError && runs.length === 0 ? (
        <div className="runs-empty" data-testid="runs-empty" role="status">
          <Heading level={2} size="sm">No runs match these filters</Heading>
          <Text tone="muted">
            Try widening the time range or clearing a filter to see more activity.
          </Text>
          {hasActiveFilters ? (
            <Button variant="secondary" onPress={reset}>Reset filters</Button>
          ) : null}
        </div>
      ) : null}

      {isError ? (
        <div className="runs-error" data-testid="runs-error" role="alert">
          <Text tone="muted">Could not load runs.</Text>
          <Button variant="secondary" onPress={() => refetch()}>Retry</Button>
        </div>
      ) : null}
    </div>
  );
}
