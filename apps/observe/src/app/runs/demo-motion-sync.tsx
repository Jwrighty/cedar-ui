"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { parseSlowMoMultiplier } from "@/lib/observe/latency";

import { demoMotionStyle, demoMotionVariableNames } from "../demo-motion";

export function DemoMotionSync() {
  const searchParams = useSearchParams();
  const slowMoMultiplier = parseSlowMoMultiplier(searchParams.get("slowMo"));

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const previousValues = new Map(
      demoMotionVariableNames.map((name) => [
        name,
        rootStyle.getPropertyValue(name),
      ]),
    );
    const nextValues = demoMotionStyle(slowMoMultiplier);

    for (const name of demoMotionVariableNames) {
      rootStyle.setProperty(name, nextValues[name]);
    }

    return () => {
      for (const [name, value] of previousValues) {
        if (value) {
          rootStyle.setProperty(name, value);
        } else {
          rootStyle.removeProperty(name);
        }
      }
    };
  }, [slowMoMultiplier]);

  return null;
}
