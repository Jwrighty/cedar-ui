"use client";

import { useEffect, useState } from "react";

import type { LiveFeedEvent } from "@/lib/observe/api";
import type { Run } from "@/lib/observe/domain";

export function useLiveRuns({ enabled }: { enabled: boolean }): Run[] {
  const [liveRuns, setLiveRuns] = useState<Run[]>([]);

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
      setLiveRuns((prev) => {
        if (parsed.type === "run") {
          return prev.some((r) => r.id === parsed.run.id)
            ? prev
            : [parsed.run, ...prev];
        }
        return prev.map((r) =>
          r.id === parsed.id
            ? { ...r, status: parsed.status, durationMs: parsed.durationMs }
            : r,
        );
      });
    };
    source.onerror = () => source.close();
    return () => source.close();
  }, [enabled]);

  return liveRuns;
}
