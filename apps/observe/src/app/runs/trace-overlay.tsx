"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type ReactNode } from "react";

import { Dialog, IconButton, Tooltip } from "@jwrighty/cedar-react";

import { TRACE_ORIGIN_ROW_STORAGE_KEY } from "./trace-transition";

interface TraceOverlayProps {
  children: ReactNode;
  runId: string;
  titleId: string;
}

/**
 * Trace overlay built on Cedar's `Dialog`, rendered controlled inside the
 * intercepting route: it is open for as long as the `/runs/[id]` modal route is
 * mounted. React Aria owns the focus trap, scroll lock, `aria-hidden` on the
 * background, and dismiss-on-escape / outside-click; Cedar owns the entry/exit
 * motion. On close we let the exit animation play, then `router.back()` to sync
 * the URL, and hand focus back to the originating row via session storage.
 */
export function TraceOverlay({ children, runId, titleId }: TraceOverlayProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const isClosingRef = useRef(false);

  const close = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    // Restore focus to the row we came from once the feed re-renders.
    window.sessionStorage.setItem(TRACE_ORIGIN_ROW_STORAGE_KEY, runId);
    // Flip to closed so React Aria plays the exit animation, then leave the
    // route once the dialog's own exit animation ends so the panel doesn't
    // vanish mid-animation. A timeout backs this up if the animation is absent.
    setIsOpen(false);

    const overlay = document.querySelector<HTMLElement>("[data-trace-overlay]");
    let navigated = false;
    const navigate = () => {
      if (navigated) {
        return;
      }
      navigated = true;
      overlay?.removeEventListener("animationend", onExitEnd);
      router.back();
    };
    const onExitEnd = (event: AnimationEvent) => {
      // Ignore bubbling animationend events from waterfall bars etc. — only the
      // dialog's own scrim/panel exit should trigger the route change.
      if (event.animationName.startsWith("cedar-dialog")) {
        navigate();
      }
    };

    if (overlay) {
      overlay.addEventListener("animationend", onExitEnd);
      window.setTimeout(navigate, 800);
    } else {
      navigate();
    }
  }, [router, runId]);

  return (
    <Dialog.Content
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      aria-labelledby={titleId}
      className="trace-overlay-dialog"
      data-testid="trace-overlay"
      data-trace-overlay=""
    >
      <div className="trace-overlay-dialog__chrome">
        <Tooltip.Trigger delay={500}>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Close trace overlay"
            onPress={close}
          >
            <X aria-hidden="true" />
          </IconButton>
          <Tooltip placement="left">Close trace overlay</Tooltip>
        </Tooltip.Trigger>
      </div>
      {children}
    </Dialog.Content>
  );
}
