"use client";

import { AnimatePresence } from "framer-motion";
import { AgentStep, type ToolStep } from "./agent-step";
import { ThinkingIndicator } from "./thinking-indicator";
import { SourceCard } from "./source-card";
import { useEffect, useRef } from "react";
import { Activity, Globe } from "lucide-react";
import type { UIMessage } from "ai";

interface AnalyzeOutput {
  url: string;
  title?: string;
  domain: string;
  credibilityScore: number;
}

interface ActivityFeedProps {
  messages: UIMessage[];
  isLoading: boolean;
}

function extractToolSteps(messages: UIMessage[]): ToolStep[] {
  const steps: ToolStep[] = [];
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const part of msg.parts) {
      if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
        const toolPart = part as {
          type: string;
          toolCallId: string;
          toolName?: string;
          state: string;
          input?: Record<string, unknown>;
          output?: Record<string, unknown>;
        };
        const toolName =
          toolPart.toolName ||
          (part.type.startsWith("tool-") ? part.type.slice(5) : "unknown");
        steps.push({
          toolCallId: toolPart.toolCallId,
          toolName,
          state: toolPart.state,
          input: toolPart.input || {},
          output: toolPart.output,
        });
      }
    }
  }
  return steps;
}

export function ActivityFeed({ messages, isLoading }: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const toolSteps = extractToolSteps(messages);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [toolSteps.length, isLoading]);

  const analyzedSources = toolSteps
    .filter((t) => t.toolName === "analyzeSource" && t.state === "output-available" && t.output)
    .map((t) => t.output as unknown as AnalyzeOutput);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Activity Log */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-3.5 h-3.5 text-secondary" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Agent Activity
          </h3>
          {toolSteps.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
              {toolSteps.length}
            </span>
          )}
        </div>
        <div
          ref={scrollRef}
          className="space-y-2 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-1"
        >
          <AnimatePresence mode="popLayout">
            {toolSteps.map((step, i) => (
              <AgentStep key={step.toolCallId} step={step} index={i} />
            ))}
          </AnimatePresence>
          {isLoading && <ThinkingIndicator />}
        </div>
      </div>

      {/* Sources Panel */}
      {analyzedSources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sources
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {analyzedSources.length}
            </span>
          </div>
          <div className="space-y-2">
            {analyzedSources.map((source, i) => (
              <SourceCard
                key={source.url}
                title={source.title || source.domain}
                url={source.url}
                domain={source.domain}
                credibilityScore={source.credibilityScore}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
