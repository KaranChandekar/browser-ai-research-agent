import { tool } from "ai";
import { z } from "zod";
import { calculateCredibility } from "./credibility";

export const searchWeb = tool({
  description:
    "Search the web for information on a topic. Use this to find relevant sources and articles. Returns a list of search results with titles, URLs, and snippets.",
  inputSchema: z.object({
    query: z.string().describe("The search query to find information about"),
  }),
  execute: async ({ query }) => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error("SERPER_API_KEY is not configured");
    }

    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 6 }),
    });

    if (!res.ok) {
      throw new Error(`Search API error: ${res.status}`);
    }

    const data = await res.json();
    const results = (data.organic || []).map(
      (r: { title: string; link: string; snippet: string }) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      })
    );

    return { query, results, resultCount: results.length };
  },
});

export const readPage = tool({
  description:
    "Read and extract the main text content from a webpage URL. Use this to get detailed information from a specific source. Returns the extracted text content.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the webpage to read"),
    title: z.string().optional().describe("Optional title for reference"),
  }),
  execute: async ({ url, title }) => {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "text",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to read page: ${res.status}`);
    }

    const text = await res.text();
    const content = text.slice(0, 6000);

    return {
      url,
      title: title || url,
      content,
      contentLength: text.length,
      truncated: text.length > 6000,
    };
  },
});

export const analyzeSource = tool({
  description:
    "Analyze a source for credibility and reliability. Use this after reading a page to assess how trustworthy the information is. Returns a credibility score and analysis.",
  inputSchema: z.object({
    url: z.string().describe("The URL of the source to analyze"),
    content: z.string().describe("The content of the source to analyze"),
    title: z.string().optional().describe("The title of the source"),
  }),
  execute: async ({ url, content, title }) => {
    const credibilityScore = calculateCredibility(url, content);
    let domain: string;
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = url;
    }

    return {
      url,
      title: title || domain,
      domain,
      credibilityScore,
      isReliable: credibilityScore >= 60,
      assessment:
        credibilityScore >= 75
          ? "Highly credible source"
          : credibilityScore >= 50
            ? "Moderately credible source"
            : "Lower credibility — verify claims with other sources",
    };
  },
});

export const allTools = { searchWeb, readPage, analyzeSource };
