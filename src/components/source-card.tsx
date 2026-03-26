"use client";

import { motion } from "framer-motion";
import { ExternalLink, Shield } from "lucide-react";
import { getCredibilityLabel } from "@/lib/credibility";

interface SourceCardProps {
  title: string;
  url: string;
  domain: string;
  credibilityScore: number;
  index: number;
}

export function SourceCard({
  title,
  url,
  domain,
  credibilityScore,
  index,
}: SourceCardProps) {
  const { label, color } = getCredibilityLabel(credibilityScore);

  const bgColor =
    credibilityScore >= 75
      ? "from-emerald-500/5 to-teal-500/5"
      : credibilityScore >= 50
      ? "from-amber-500/5 to-yellow-500/5"
      : "from-red-500/5 to-orange-500/5";

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-gradient-to-r ${bgColor} hover:border-primary/30 transition-all group`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
            {index + 1}
          </span>
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate pl-7">
          {domain}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Shield className={`w-3.5 h-3.5 ${color}`} />
          <span className={`text-[10px] sm:text-xs font-medium ${color}`}>
            {label}
          </span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.a>
  );
}
