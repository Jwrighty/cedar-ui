"use client";

import { useEffect, useState } from "react";

import type { Run } from "@/lib/observe/domain";

export function useLiveRuns({ enabled }: { enabled: boolean }): Run[] {
  const [liveRuns, setLiveRuns] = useState<Run[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource("/api/runs/stream");
    source.onmessage = (event) => {
      const run = JSON.parse(event.data) as Run;
      setLiveRuns((prev) =>
        prev.some((r) => r.id === run.id) ? prev : [run, ...prev],
      );
    };
    source.onerror = () => source.close();
    return () => source.close();
  }, [enabled]);

  return liveRuns;
}
