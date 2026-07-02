import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "../dashboard-shell";
import { DemoMotionSync } from "./demo-motion-sync";

export default function RunsLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <DashboardShell>
      <Suspense fallback={null}>
        <DemoMotionSync />
      </Suspense>
      {children}
      {modal}
    </DashboardShell>
  );
}
