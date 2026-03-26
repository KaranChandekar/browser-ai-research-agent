"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useState, useEffect } from "react";
import { ResearchInput } from "@/components/research-input";
import { ActivityFeed } from "@/components/activity-feed";
import { ReportView } from "@/components/report-view";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Zap } from "lucide-react";

function ResearchAppInner({ transport }: { transport: InstanceType<typeof DefaultChatTransport<UIMessage>> }) {
  const [question, setQuestion] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  const { messages, status, sendMessage, stop, error } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (q: string) => {
    setQuestion(q);
    setHasStarted(true);
    sendMessage({ text: q });
  };

  const handleNewResearch = () => {
    window.location.reload();
  };

  // Count tool steps from messages
  const toolStepCount = messages
    .filter((m) => m.role === "assistant")
    .flatMap(
      (m) =>
        m.parts.filter(
          (p) => p.type.startsWith("tool-") || p.type === "dynamic-tool"
        )
    ).length;

  // Get the report text from the last assistant message's text parts
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const reportContent =
    !isLoading && lastAssistant
      ? lastAssistant.parts
          .filter(
            (p): p is { type: "text"; text: string } => p.type === "text"
          )
          .map((p) => p.text)
          .join("")
      : null;

  return (
    <main className="min-h-screen mesh-bg">
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-screen p-4 sm:p-6"
            >
              <ResearchInput onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="research"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto p-4 sm:p-6"
            >
              {/* Header */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <button
                  onClick={handleNewResearch}
                  className="p-2 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg font-semibold truncate">
                    {question}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {isLoading ? (
                      <Zap className="w-3 h-3 text-secondary" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>
                      {isLoading
                        ? "Researching..."
                        : `Completed — ${toolStepCount} steps`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <ThemeSwitcher />
                  {isLoading && (
                    <button
                      onClick={() => stop()}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
                  Error: {error.message}
                </div>
              )}

              {/* Main content: Activity feed + Report */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Activity Feed - Left sidebar */}
                <div className="lg:col-span-4 order-2 lg:order-1">
                  <ActivityFeed messages={messages} isLoading={isLoading} />
                </div>

                {/* Report - Main area */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                  {reportContent ? (
                    <ReportView content={reportContent} question={question} />
                  ) : isLoading ? (
                    <div className="flex items-center justify-center h-48 sm:h-64 rounded-2xl border border-border/50 bg-card/30 glass">
                      <div className="text-center px-4">
                        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-warning/10 border border-primary/10 mb-4">
                          <Zap className="w-6 h-6 text-secondary animate-pulse" />
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          The agent is gathering and analyzing sources...
                        </div>
                        <div className="text-xs text-muted-foreground/50">
                          The report will appear here once complete
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function ResearchApp() {
  const [transport, setTransport] = useState<DefaultChatTransport<UIMessage> | null>(null);

  useEffect(() => {
    setTransport(new DefaultChatTransport<UIMessage>({ api: "/api/research" }));
  }, []);

  if (!transport) {
    return (
      <main className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="relative z-10 text-muted-foreground text-sm">Loading...</div>
      </main>
    );
  }

  return <ResearchAppInner transport={transport} />;
}
