"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function MotionStatus({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.18,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.p>
  );
}
