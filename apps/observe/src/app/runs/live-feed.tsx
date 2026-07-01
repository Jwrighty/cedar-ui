"use client";

import { Suspense } from "react";

import { Heading } from "@jwrighty/cedar-react";

import { RunsFilterBar } from "./runs-filter-bar";
import { RunsTable } from "./runs-table";
import "./runs-feed.css";

export function LiveFeed() {
  return (
    <section className="runs-feed" aria-labelledby="runs-feed-title">
      <Heading id="runs-feed-title" level={1} size="md">Live feed</Heading>
      {/* useSearchParams requires a Suspense boundary in the App Router. */}
      <Suspense>
        <RunsFilterBar />
        <RunsTable />
      </Suspense>
    </section>
  );
}
