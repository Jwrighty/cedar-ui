import { notFound } from "next/navigation";

import { runSummary } from "@/lib/observe/api";

import { TracePageContent } from "./trace-page-content";

export const dynamic = "force-dynamic";

interface RunPageProps {
  params: Promise<{ id: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { id } = await params;
  const run = runSummary(id);

  if (!run) {
    notFound();
  }

  return <TracePageContent run={run} titleId="trace-page-title" />;
}
