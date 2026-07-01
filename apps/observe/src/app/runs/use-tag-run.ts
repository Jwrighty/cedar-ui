"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      const snapshots = queryClient.getQueriesData<{ pages: RunsPage[] }>({
        queryKey: ["runs"],
      });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        queryClient.setQueryData(key, {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            runs: page.runs.map((run) =>
              run.id === id
                ? {
                    ...run,
                    tags:
                      op === "add"
                        ? Array.from(new Set([...run.tags, tag]))
                        : run.tags.filter((t) => t !== tag),
                  }
                : run,
            ),
          })),
        });
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
    onSuccess: () => {
      toast.success({ title: "Tag updated" });
    },
  });
}
