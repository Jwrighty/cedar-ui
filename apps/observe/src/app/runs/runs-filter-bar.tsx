"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@jwrighty/cedar-react";

import type { Environment } from "@/lib/observe/domain";
import { useRunsSearchParams } from "./use-runs-search-params";

interface Facets {
  models: string[];
  environments: Environment[];
  referenceTime: string;
}

const STATUS_OPTIONS = ["running", "success", "error"] as const;
const RANGE_PRESETS: { label: string; hours: number | null }[] = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "All", hours: null },
];

export function RunsFilterBar() {
  const { filters, setFilter, reset, hasActiveFilters } = useRunsSearchParams();
  const { data: facets } = useQuery<Facets>({
    queryKey: ["runs-facets"],
    queryFn: async () => {
      const res = await fetch("/api/runs/facets");
      if (!res.ok) throw new Error("facets");
      return res.json();
    },
  });

  function applyRange(hours: number | null) {
    if (hours === null || !facets) {
      setFilter("from", null);
      return;
    }
    const from = new Date(
      Date.parse(facets.referenceTime) - hours * 60 * 60 * 1000,
    ).toISOString();
    setFilter("from", from);
  }

  return (
    <div className="runs-filter-bar" data-testid="runs-filter-bar">
      <label className="runs-filter">
        <span className="runs-filter__label">Status</span>
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilter("status", e.target.value || null)}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s[0]!.toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="runs-filter">
        <span className="runs-filter__label">Model</span>
        <select
          value={filters.model ?? ""}
          onChange={(e) => setFilter("model", e.target.value || null)}
        >
          <option value="">All</option>
          {(facets?.models ?? []).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="runs-filter">
        <span className="runs-filter__label">Environment</span>
        <select
          value={filters.environment ?? ""}
          onChange={(e) => setFilter("environment", e.target.value || null)}
        >
          <option value="">All</option>
          {(facets?.environments ?? []).map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
      </label>

      <div className="runs-filter" role="group" aria-label="Time range">
        <span className="runs-filter__label">Range</span>
        <div className="runs-range">
          {RANGE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="runs-range__btn"
              onClick={() => applyRange(preset.hours)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters ? (
        <Button variant="secondary" onPress={reset}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}
