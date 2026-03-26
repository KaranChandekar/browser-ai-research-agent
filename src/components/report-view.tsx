"use client";

import { motion } from "framer-motion";
import { FileText, Download, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface ReportViewProps {
  content: string;
  question: string;
}

export function ReportView({ content, question }: ReportViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleExport = useCallback(async () => {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report: content, question }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, question]);

  const rendered = renderMarkdown(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card/80 glass overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold">Research Report</h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 hover:bg-muted hover:border-primary/30 transition-all"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      <div
        className="p-4 sm:p-6 prose max-w-none
          [&_h1]:text-lg [&_h1]:sm:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-foreground
          [&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground [&_h2]:border-b [&_h2]:border-border/30 [&_h2]:pb-2
          [&_h3]:text-sm [&_h3]:sm:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground
          [&_p]:text-sm [&_p]:text-foreground/80 [&_p]:leading-relaxed [&_p]:mb-3
          [&_ul]:text-sm [&_ul]:text-foreground/80 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5
          [&_ol]:text-sm [&_ol]:text-foreground/80 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5
          [&_li]:mb-1.5
          [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary [&_a]:transition-colors
          [&_strong]:text-foreground [&_strong]:font-semibold
          [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:pr-3 [&_blockquote]:rounded-r-lg
          [&_hr]:border-border/30 [&_hr]:my-4
          [&_code]:text-xs [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-secondary"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </motion.div>
  );
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Horizontal rules
    .replace(/^---$/gm, "<hr>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, "<li>$1</li>")
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Paragraphs (double newline)
    .replace(/\n\n/g, "</p><p>")
    // Single newlines within list context stay
    .replace(/\n/g, "<br>")
    // Wrap
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
