"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@jwrighty/cedar-react";

import {
  parseSlowMoMultiplier,
  type SlowMoMultiplier,
} from "@/lib/observe/latency";

const slowMoOptions: SlowMoMultiplier[] = [1, 2, 4];

export function DemoModeControl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const activeSlowMo = parseSlowMoMultiplier(searchParams.get("slowMo"));
  const isBusy = !isHydrated || isPending;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const updateDemoParams = (slowMoMultiplier = activeSlowMo) => {
    const params = new URLSearchParams(searchParams);
    params.set("replay", String(Date.now()));

    if (slowMoMultiplier === 1) {
      params.delete("slowMo");
    } else {
      params.set("slowMo", String(slowMoMultiplier));
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div
      className="demo-mode"
      role="group"
      aria-label="Demo mode replay controls"
      data-testid="demo-mode-control"
    >
      <Button
        className="demo-mode__replay"
        size="sm"
        variant="primary"
        onPress={() => updateDemoParams()}
        isDisabled={isBusy}
      >
        Replay
      </Button>

      <div className="demo-mode__speeds" role="group" aria-label="Slow motion speed">
        {slowMoOptions.map((option) => (
          <Button
            key={option}
            className="demo-mode__speed"
            size="sm"
            variant={activeSlowMo === option ? "secondary" : "ghost"}
            aria-pressed={activeSlowMo === option}
            onPress={() => updateDemoParams(option)}
            isDisabled={isBusy}
          >
            {option}x
          </Button>
        ))}
      </div>
    </div>
  );
}
