# Browser AI Research Agent

An autonomous AI-powered research agent built with Next.js 15 that searches the web, reads pages, analyzes source credibility, and synthesizes structured cited reports — all visible through a real-time activity feed.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.5--Flash-4285F4?logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

## Overview

Ask a research question, and an AI agent autonomously breaks it into sub-questions, searches the web for sources, reads and extracts content from web pages, scores each source for credibility, cross-references claims, and writes a structured report with inline citations and confidence levels. The entire reasoning process streams to the UI in real time.

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    User Asks Question                    │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│              AI Agent Plans Research                     │
│         Breaks question into 2-4 sub-questions           │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Agent Loop (max 12 steps)                │
│                                                          │
│   ┌──────────┐    ┌──────────┐    ┌───────────────┐     │
│   │ searchWeb │───▶│ readPage │───▶│ analyzeSource │     │
│   │ (Serper)  │    │ (Jina AI)│    │ (Credibility) │     │
│   └──────────┘    └──────────┘    └───────────────┘     │
│        │               │                │                │
│        ▼               ▼                ▼                │
│   6 results per   Extract text     Score 0-100           │
│   query           (6000 chars)     per source            │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Cross-Reference & Synthesize                │
│                                                          │
│   • Compare claims across multiple sources               │
│   • Flag conflicting information                         │
│   • Assign confidence levels per finding                 │
│   • Generate structured markdown report                  │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Structured Report                        │
│                                                          │
│   • Executive Summary                                    │
│   • Key Findings with [1] [2] citations                  │
│   • Conflicting Information                              │
│   • Sources with credibility scores                      │
│   • Overall confidence assessment                        │
└─────────────────────────────────────────────────────────┘
```

## Features

- **Autonomous Multi-Step Agent** — The AI decides when to search, read, or analyze without human guidance, running up to 12 tool-calling steps per research session
- **Real-Time Activity Feed** — Watch every agent action (search queries, page reads, credibility checks) stream live with animated step cards
- **Source Credibility Scoring** — Each source is scored 0–100 based on domain authority (`.gov`, `.edu`, academic publishers), content quality, HTTPS, and references
- **Structured Cited Reports** — Final output is a markdown report with inline citations, confidence levels, and a full source list
- **Light/Dark Theme** — Toggle between dark (space-inspired) and light themes, persisted to localStorage
- **Modern Glass UI** — Gradient backgrounds, glass morphism cards, animated borders, and smooth Framer Motion transitions
- **Fully Responsive** — Optimized layout for mobile, tablet, and desktop
- **Export & Copy** — Download reports as `.md` files or copy to clipboard

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | App Router, API routes, server components |
| [Vercel AI SDK v6](https://sdk.vercel.ai) | `streamText`, tool calling, `maxSteps` agent loop |
| [Google Gemini 2.5 Flash](https://ai.google.dev) | Reasoning model for research synthesis |
| [Serper.dev](https://serper.dev) | Google Search API (2,500 free searches) |
| [Jina Reader](https://jina.ai/reader) | Webpage content extraction via `r.jina.ai` |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling with CSS variables |
| [Framer Motion](https://www.framer.com/motion) | Animations and transitions |
| [Lucide React](https://lucide.dev) | Icon system |
| [Zod](https://zod.dev) | Tool parameter validation |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with theme support
│   ├── page.tsx                   # Entry point (dynamic import, SSR disabled)
│   ├── globals.css                # Theme variables, gradients, glass effects
│   └── api/
│       ├── research/route.ts      # Agent orchestration endpoint
│       └── export/route.ts        # Report export as markdown file
├── components/
│   ├── research-app.tsx           # Main app shell with chat transport
│   ├── research-input.tsx         # Landing page with search input
│   ├── activity-feed.tsx          # Real-time agent activity sidebar
│   ├── agent-step.tsx             # Individual tool call step card
│   ├── thinking-indicator.tsx     # Animated reasoning indicator
│   ├── source-card.tsx            # Source with credibility badge
│   ├── report-view.tsx            # Rendered markdown report
│   └── theme-switcher.tsx         # Light/dark mode toggle
├── lib/
│   ├── tools.ts                   # searchWeb, readPage, analyzeSource
│   ├── credibility.ts             # Domain-based credibility scoring
│   └── utils.ts                   # cn() class merge utility
├── types/
│   └── index.ts                   # TypeScript interfaces
└── instrumentation.ts             # Node.js 25+ localStorage polyfill
```

## Getting Started

### Prerequisites

- Node.js 18+ (tested with Node.js 25)
- npm

### Installation

```bash
git clone https://github.com/KaranChandekar/browser-ai-research-agent.git
cd browser-ai-research-agent
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
SERPER_API_KEY=your_serper_api_key
```

| Variable | Where to get it |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) — free tier includes ~1M tokens/day |
| `SERPER_API_KEY` | [serper.dev](https://serper.dev) — free tier includes 2,500 searches |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start researching.

## Credibility Scoring

Sources are scored on a 0–100 scale using domain-based heuristics:

| Factor | Points |
|---|---|
| High-credibility domain (`.gov`, `.edu`, Nature, PubMed, Reuters, etc.) | +30 |
| Medium-credibility domain (Wikipedia, Stack Overflow, Bloomberg, etc.) | +15 |
| Low-credibility indicator (blogspot, tumblr, quora, etc.) | -15 |
| HTTPS | +5 |
| Substantial content (>1000 characters) | +5 |
| Contains references/bibliography | +5 |
| Mentions peer-review or studies | +5 |

Base score starts at 50. Final score is clamped between 0 and 100.

| Score | Label | Meaning |
|---|---|---|
| 75–100 | High | Established, authoritative source |
| 50–74 | Medium | Generally reliable, verify key claims |
| 0–49 | Low | Use with caution, cross-reference required |

## License

MIT
