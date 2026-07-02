import { notFound } from "next/navigation";

import { runSummary } from "@/lib/observe/api";

import { TracePageContent } from "../../[id]/trace-page-content";
import { TraceOverlay } from "../../trace-overlay";

export const dynamic = "force-dynamic";

interface TraceOverlayPageProps {
  params: Promise<{ id: string }>;
}

export default async function TraceOverlayPage({
  params,
}: TraceOverlayPageProps) {
  const { id } = await params;
  const run = runSummary(id);

  if (!run) {
    notFound();
  }

  const titleId = "trace-overlay-title";

  return (
    <TraceOverlay runId={run.id} titleId={titleId}>
      <TracePageContent run={run} titleId={titleId} variant="overlay" />
    </TraceOverlay>
  );
}
