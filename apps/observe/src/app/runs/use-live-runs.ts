"use client";

import { useEffect, useRef, useState } from "react";

import type { Run } from "@/lib/observe/domain";
import type { LiveFeedEvent } from "@/lib/observe/api";

export interface LiveRunsState {
  liveRuns: Run[];
  announcement: string;
}

export function useLiveRuns({ enabled }: { enabled: boolean }): LiveRunsState {
  const [liveRuns, setLiveRuns] = useState<Run[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const pendingRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource("/api/runs/stream");
    source.onmessage = (event) => {
      let parsed: LiveFeedEvent;
      try {
        parsed = JSON.parse(event.data) as LiveFeedEvent;
      } catch {
        return;
      }
      if (parsed.type === "run") {
        setLiveRuns((prev) =>
          prev.some((r) => r.id === parsed.run.id)
            ? prev
            : [parsed.run, ...prev],
        );
        pendingRef.current += 1;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          const n = pendingRef.current;
          pendingRef.current = 0;
          setAnnouncement(
            `${n} new ${n === 1 ? "run" : "runs"} added to the feed.`,
          );
        }, 800);
      } else {
        setLiveRuns((prev) =>
          prev.map((r) =>
            r.id === parsed.id
              ? { ...r, status: parsed.status, durationMs: parsed.durationMs }
              : r,
          ),
        );
      }
    };
    source.onerror = () => source.close();
    return () => {
      source.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled]);

  return { liveRuns, announcement };
}
