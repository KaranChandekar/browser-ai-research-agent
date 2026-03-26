"use client";

import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  ShieldCheck,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const toolConfig: Record<
  string,
  { icon: typeof Search; label: string; color: string; bgFrom: string; bgTo: string }
> = {
  searchWeb: {
    icon: Search,
    label: "Searching the web",
    color: "text-blue-400",
    bgFrom: "from-blue-500/10",
    bgTo: "to-cyan-500/10",
  },
  readPage: {
    icon: BookOpen,
    label: "Reading page",
    color: "text-emerald-400",
    bgFrom: "from-emerald-500/10",
    bgTo: "to-teal-500/10",
  },
  analyzeSource: {
    icon: ShieldCheck,
    label: "Analyzing credibility",
    color: "text-amber-400",
    bgFrom: "from-amber-500/10",
    bgTo: "to-orange-500/10",
  },
};

export interface ToolStep {
  toolCallId: string;
  toolName: string;
  state: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

function getStepDetail(step: ToolStep): string {
  switch (step.toolName) {
    case "searchWeb":
      return `Query: "${step.input.query}"`;
    case "readPage":
      return `${(step.input.title as string) || (step.input.url as string)}`;
    case "analyzeSource":
      return `Evaluating: ${(step.input.title as string) || (step.input.url as string)}`;
    default:
      return "";
  }
}

function getStepResult(step: ToolStep): string | null {
  if (step.state !== "output-available" || !step.output) return null;
  const result = step.output;
  switch (step.toolName) {
    case "searchWeb":
      return `Found ${result.resultCount} results`;
    case "readPage":
      return result.truncated
        ? `Read ${result.contentLength} chars (truncated)`
        : `Read ${result.contentLength} chars`;
    case "analyzeSource":
      return `Credibility: ${result.credibilityScore}/100 — ${result.assessment}`;
    default:
      return null;
  }
}

interface AgentStepProps {
  step: ToolStep;
  index: number;
}

export function AgentStep({ step, index }: AgentStepProps) {
  const config = toolConfig[step.toolName] || {
    icon: CheckCircle,
    label: step.toolName,
    color: "text-muted-foreground",
    bgFrom: "from-muted/10",
    bgTo: "to-muted/10",
  };
  const Icon = config.icon;
  const isComplete = step.state === "output-available";
  const detail = getStepDetail(step);
  const resultText = getStepResult(step);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        isComplete
          ? "border-border/40 bg-card/60"
          : "border-primary/30 bg-gradient-to-r " + config.bgFrom + " " + config.bgTo + " glow-pulse"
      }`}
    >
      <div className={`p-2 rounded-xl bg-gradient-to-br ${config.bgFrom} ${config.bgTo} border border-border/30`}>
        {isComplete ? (
          <Icon className={`w-4 h-4 ${config.color}`} />
        ) : (
          <Loader2 className={`w-4 h-4 ${config.color} animate-spin`} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{config.label}</p>
          {isComplete && (
            <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
          )}
        </div>
        {detail && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {detail}
          </p>
        )}
        {resultText && (
          <p className="text-xs text-muted-foreground/70 mt-1 italic">
            {resultText}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function AgentError({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/5"
    >
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <p className="text-sm text-destructive">{message}</p>
    </motion.div>
  );
}
