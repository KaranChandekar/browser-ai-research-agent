const HIGH_CREDIBILITY_DOMAINS = [
  "nature.com",
  "science.org",
  "pubmed.ncbi.nlm.nih.gov",
  "arxiv.org",
  "gov",
  "edu",
  "bbc.com",
  "reuters.com",
  "apnews.com",
  "nytimes.com",
  "washingtonpost.com",
  "theguardian.com",
  "economist.com",
  "who.int",
  "un.org",
  "ieee.org",
  "acm.org",
  "springer.com",
  "wiley.com",
  "nih.gov",
  "cdc.gov",
  "mayo.clinic",
];

const MEDIUM_CREDIBILITY_DOMAINS = [
  "wikipedia.org",
  "medium.com",
  "stackoverflow.com",
  "github.com",
  "techcrunch.com",
  "wired.com",
  "arstechnica.com",
  "theverge.com",
  "cnbc.com",
  "bloomberg.com",
  "forbes.com",
];

const LOW_CREDIBILITY_INDICATORS = [
  "blogspot",
  "wordpress.com",
  "tumblr.com",
  "reddit.com",
  "quora.com",
  "yahoo.answers",
];

export function calculateCredibility(url: string, content: string): number {
  let score = 50; // Base score

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    // Check high credibility domains
    if (
      HIGH_CREDIBILITY_DOMAINS.some(
        (d) => hostname.includes(d) || hostname.endsWith(".gov") || hostname.endsWith(".edu")
      )
    ) {
      score += 30;
    }

    // Check medium credibility domains
    if (MEDIUM_CREDIBILITY_DOMAINS.some((d) => hostname.includes(d))) {
      score += 15;
    }

    // Check low credibility indicators
    if (LOW_CREDIBILITY_INDICATORS.some((d) => hostname.includes(d))) {
      score -= 15;
    }

    // HTTPS bonus
    if (url.startsWith("https")) {
      score += 5;
    }

    // Content quality heuristics
    if (content.length > 1000) score += 5; // Substantial content
    if (content.includes("References") || content.includes("Bibliography")) score += 5;
    if (content.includes("peer-reviewed") || content.includes("study")) score += 5;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, score));
  } catch {
    return 40; // Default for unparseable URLs
  }
}

export function getCredibilityLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 75) return { label: "High", color: "text-success" };
  if (score >= 50) return { label: "Medium", color: "text-warning" };
  return { label: "Low", color: "text-destructive" };
}
