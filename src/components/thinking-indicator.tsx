"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 glow-pulse"
    >
      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15">
        <Brain className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gradient">Agent is reasoning</span>
        <motion.div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-secondary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
