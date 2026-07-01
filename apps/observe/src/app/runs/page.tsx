import { DashboardShell } from "../dashboard-shell";
import { LiveFeed } from "./live-feed";

export default function RunsPage() {
  return (
    <DashboardShell>
      <LiveFeed />
    </DashboardShell>
  );
}
