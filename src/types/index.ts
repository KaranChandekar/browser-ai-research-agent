export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SourceAnalysis {
  credibilityScore: number;
  domain: string;
  isReliable: boolean;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  content?: string;
  credibilityScore: number;
  domain: string;
}

export interface ResearchStep {
  id: string;
  type: "search" | "read" | "analyze" | "think" | "synthesize";
  label: string;
  detail: string;
  timestamp: number;
  status: "running" | "completed" | "error";
  result?: unknown;
}

export interface ResearchReport {
  question: string;
  summary: string;
  findings: ResearchFinding[];
  sources: ResearchSource[];
  confidence: "high" | "medium" | "low";
  generatedAt: string;
}

export interface ResearchFinding {
  claim: string;
  evidence: string;
  sourceIds: string[];
  confidence: "high" | "medium" | "low";
}

export interface ResearchSession {
  id: string;
  question: string;
  status: "idle" | "researching" | "completed" | "error";
  steps: ResearchStep[];
  sources: ResearchSource[];
  report?: string;
  startedAt?: number;
  completedAt?: number;
}
