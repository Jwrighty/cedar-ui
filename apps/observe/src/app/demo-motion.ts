import type { CSSProperties } from "react";

import type { SlowMoMultiplier } from "@/lib/observe/latency";

export const demoMotionVariableNames = [
  "--semantic-motion-duration-feedback",
  "--semantic-motion-duration-settle",
  "--semantic-motion-duration-draw",
] as const;

export type DemoMotionProperties = CSSProperties &
  Record<(typeof demoMotionVariableNames)[number], string>;

export function demoMotionStyle(
  slowMoMultiplier: SlowMoMultiplier,
): DemoMotionProperties {
  return {
    "--semantic-motion-duration-feedback": `calc(var(--base-motion-duration-fast) * ${slowMoMultiplier})`,
    "--semantic-motion-duration-settle": `calc(var(--base-motion-duration-base) * ${slowMoMultiplier})`,
    "--semantic-motion-duration-draw": `calc(var(--base-motion-duration-draw) * ${slowMoMultiplier})`,
  };
}
