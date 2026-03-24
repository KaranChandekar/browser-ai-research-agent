---
name: browser-ai-research-agent
description: "Build an autonomous AI research agent that searches, reads, and synthesizes multiple sources into cited reports with visible reasoning. Use this skill whenever the user wants to work on the research agent project, mentions AI agent, autonomous agent, research agent, multi-step reasoning, tool calling, agentic UI, CopilotKit, AG-UI protocol, or wants to build/extend/debug any part of this application. Also trigger when the user mentions visible reasoning chains, agent activity feeds, or source credibility scoring in the context of this project."
---

# Browser AI Research Agent

## What You're Building

A Next.js application where users input a research question and an AI agent autonomously searches, reads, analyzes multiple sources, and synthesizes findings into a structured report with citations. The entire process is visible through a real-time activity feed showing the agent's reasoning, search queries, and analysis steps.

This is an **AI Agent** project — the AI doesn't just respond once; it takes multiple autonomous steps, uses tools, and reasons about what to do next.

## Architecture Overview

```
app/
├── layout.tsx
├── page.tsx                      # Research input
├── research/[id]/page.tsx        # Research session view
├── api/
│   ├── research/route.ts         # Agent orchestration endpoint
│   ├── tools/
│   │   ├── search.ts             # Web search tool
│   │   ├── read.ts               # Page reading tool
│   │   └── analyze.ts            # Source analysis tool
│   └── export/route.ts           # Export report
├── components/
│   ├── research-input.tsx        # Question input with examples
│   ├── activity-feed.tsx         # Real-time agent activity log
│   ├── agent-step.tsx            # Individual step (search, read, think)
│   ├── thinking-indicator.tsx    # Shows agent's current reasoning
│   ├── source-card.tsx           # Found source with credibility score
│   ├── report-view.tsx           # Final structured report
│   ├── citation-link.tsx         # Inline citation with hover preview
│   └── follow-up-panel.tsx       # Ask follow-up questions
├── lib/
│   ├── agent.ts                  # Agent loop with tool calling
│   ├── tools.ts                  # Tool definitions
│   ├── schemas.ts                # Zod schemas for report structure
│   └── credibility.ts            # Source credibility heuristics
└── types/
    └── index.ts
```

## Tech Stack & Setup

```bash
npx create-next-app@latest research-agent --typescript --tailwind --eslint --app
cd research-agent

# Core AI (agent capabilities)
npm install ai @ai-sdk/google zod

# UI
npm install framer-motion lucide-react
npx shadcn@latest init
npx shadcn@latest add button card tabs badge avatar accordion skeleton scroll-area
```

### Environment Variables

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
SERPER_API_KEY=your_serper_key              # Free: 2,500 searches (serper.dev)
# OR use Google Custom Search API (100 free/day)
```

## Core Implementation Strategy

### 1. Tool Definitions

The agent needs tools to interact with the outside world. Each tool has a description (so the AI knows when to use it) and a Zod schema for its parameters.

```typescript
// lib/tools.ts
import { tool } from "ai";
import { z } from "zod";

export const searchWeb = tool({
  description: "Search the web for information. Use this to find sources.",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": process.env.SERPER_API_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: 5 }),
    });
    const data = await res.json();
    return data.organic.map(r => ({ title: r.title, url: r.link, snippet: r.snippet }));
  },
});

export const readPage = tool({
  description: "Read and extract content from a webpage URL.",
  parameters: z.object({
    url: z.string().url(),
  }),
  execute: async ({ url }) => {
    // Use a free extraction service or Cheerio
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain" },
    });
    const text = await res.text();
    return text.slice(0, 5000); // Limit to ~5000 chars
  },
});

export const analyzeSource = tool({
  description: "Analyze a source for credibility and extract key claims.",
  parameters: z.object({
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ content, url }) => {
    // Heuristic credibility scoring
    const score = calculateCredibility(url, content);
    return { credibilityScore: score, domain: new URL(url).hostname };
  },
});
```

### 2. Agent Loop with Streaming

The agent uses `streamText` with `maxSteps` to allow multi-turn tool calling. Each step is streamed to the frontend.

```typescript
// app/api/research/route.ts
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { searchWeb, readPage, analyzeSource } from "@/lib/tools";

export async function POST(req: Request) {
  const { question } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    tools: { searchWeb, readPage, analyzeSource },
    maxSteps: 10, // Allow up to 10 autonomous steps
    system: `You are a research agent. Given a question, autonomously:

1. Break the question into sub-questions
2. Search for each sub-question using searchWeb
3. Read the most promising sources using readPage
4. Analyze source credibility using analyzeSource
5. Cross-reference claims across multiple sources
6. Synthesize findings into a structured report with citations

Think step by step. After each tool call, reflect on what you learned
and what you still need to find out. Stop when you have enough
information to write a comprehensive answer.

Format your final report with:
- Executive summary
- Key findings (with inline citations like [1], [2])
- Source list with credibility scores
- Confidence level for each finding`,
    prompt: question,
  });

  return result.toDataStreamResponse();
}
```

### 3. Real-Time Activity Feed

The frontend shows each agent step as it happens — searches, page reads, reasoning — creating a visible chain of thought.

```typescript
// components/activity-feed.tsx
"use client";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";

export function ActivityFeed({ question }) {
  const { messages, isLoading } = useChat({
    api: "/api/research",
    body: { question },
  });

  // Parse tool calls from the message stream
  const steps = messages.flatMap(msg =>
    msg.toolInvocations?.map(tool => ({
      type: tool.toolName,
      args: tool.args,
      result: tool.result,
      state: tool.state,
    })) ?? []
  );

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AgentStep step={step} />
          </motion.div>
        ))}
      </AnimatePresence>
      {isLoading && <ThinkingIndicator />}
    </div>
  );
}
```

### 4. Agent Step Component

Visual representation of each action the agent takes.

```typescript
// components/agent-step.tsx
import { Search, BookOpen, Brain, CheckCircle } from "lucide-react";

const icons = { searchWeb: Search, readPage: BookOpen, analyzeSource: Brain };

export function AgentStep({ step }) {
  const Icon = icons[step.type] || CheckCircle;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="p-2 rounded-full bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{stepLabel(step)}</p>
        <p className="text-xs text-muted-foreground mt-1">{stepDetail(step)}</p>
        {step.state === "result" && (
          <div className="mt-2 text-xs text-green-600">Completed</div>
        )}
      </div>
    </div>
  );
}
```

## Implementation Phases

### Phase 1: Agent Core (Week 1)
- Research question input with example prompts
- Agent endpoint with search + read tools
- Real-time activity feed showing agent steps
- Basic report generation with citations
- Tool call visualization (searching, reading, thinking)

### Phase 2: Source Quality (Week 2)
- Source credibility scoring (domain authority heuristics)
- Cross-reference detection (same claim from multiple sources)
- Confidence levels on findings
- Source cards with preview snippets
- Expandable tool call results

### Phase 3: Polish (Week 3)
- Follow-up questions with maintained context
- Export report as formatted document
- Research session history
- Share research via URL
- Loading animations and micro-interactions
- Mobile responsive design

## Free Resources

| Resource | Purpose | Free Tier |
|----------|---------|-----------|
| Google Gemini API | Agent reasoning | ~1M tokens/day |
| Serper.dev | Web search API | 2,500 free searches |
| Jina Reader | Page extraction | Free tier |
| Vercel | Hosting | 100GB bandwidth |
| Framer Motion | Animations | Open source |

## Resume Talking Points

- **AI Agent architecture**: Multi-step autonomous execution with tool calling. The #1 trend in AI for 2026.
- **Visible reasoning**: Streaming the agent's thought process shows you understand agent state management and UX.
- **Tool calling pattern**: Defining tools with Zod schemas and letting the AI decide when to use them.
- **maxSteps loop**: The agent runs up to N iterations, deciding at each step whether to search, read, or synthesize.
- **Source credibility**: Heuristic scoring shows you think about information quality, not just generation.
