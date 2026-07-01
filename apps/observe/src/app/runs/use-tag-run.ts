"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { useToast } from "@jwrighty/cedar-react";

import type { Run } from "@/lib/observe/domain";

interface TagVars {
  id: string;
  tag: string;
  op: "add" | "remove";
}

interface RunsPage {
  runs: Run[];
  nextCursor: string | null;
  generatedAt: string;
}

type RunsCache = InfiniteData<RunsPage, string | null>;

function updateRunTags(
  data: RunsCache | undefined,
  id: string,
  updater: (tags: string[]) => string[],
): RunsCache | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      runs: page.runs.map((run) =>
        run.id === id ? { ...run, tags: updater(run.tags) } : run,
      ),
    })),
  };
}

export function useTagRun() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, tag, op }: TagVars) => {
      const res = await fetch(`/api/runs/${id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag, op }),
      });
      if (!res.ok) throw new Error("Tag rejected");
      return res.json() as Promise<{ id: string; tags: string[] }>;
    },
    onMutate: async ({ id, tag, op }) => {
      await queryClient.cancelQueries({ queryKey: ["runs"] });
      const snapshots = queryClient.getQueriesData<RunsCache>({
        queryKey: ["runs"],
      });
      for (const [key, data] of snapshots) {
        queryClient.setQueryData(
          key,
          updateRunTags(data, id, (tags) =>
            op === "add"
              ? Array.from(new Set([...tags, tag]))
              : tags.filter((t) => t !== tag),
          ),
        );
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
      toast.error({
        title: "Couldn’t update tag",
        description: "Change reverted.",
      });
    },
    onSuccess: ({ id, tags }) => {
      const snapshots = queryClient.getQueriesData<RunsCache>({
        queryKey: ["runs"],
      });
      for (const [key, data] of snapshots) {
        queryClient.setQueryData(
          key,
          updateRunTags(data, id, () => tags),
        );
      }
      toast.success({ title: "Tag updated" });
    },
  });
}
