"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles, Zap } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

const EXAMPLE_PROMPTS = [
  "What are the latest breakthroughs in nuclear fusion energy?",
  "How does mRNA vaccine technology work and what are its future applications?",
  "What is the current state of quantum computing and when will it be practical?",
  "What are the environmental impacts of deep-sea mining?",
  "How effective are different approaches to carbon capture?",
  "What is the evidence for and against intermittent fasting?",
];

interface ResearchInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export function ResearchInput({ onSubmit, isLoading }: ResearchInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  const handleExample = (prompt: string) => {
    setQuestion(prompt);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      {/* Theme switcher - top right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-10"
      >
        {/* Logo / Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="flex items-center justify-center gap-2 mb-5 sm:mb-6"
        >
          <div className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-warning/10 border border-primary/20">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-secondary/20 border border-secondary/30">
              <Zap className="w-3 h-3 text-secondary" />
            </div>
          </div>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
          <span className="text-gradient">AI Research Agent</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Ask a research question and watch the AI agent search, read, analyze,
          and synthesize sources in real time.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        onSubmit={handleSubmit}
        className="relative mb-6 sm:mb-8"
      >
        <div className="relative flex items-center group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-warning/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <Search className="absolute left-4 sm:left-5 w-5 h-5 text-muted-foreground z-10" />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to research?"
            disabled={isLoading}
            className="relative w-full pl-12 sm:pl-14 pr-14 sm:pr-16 py-4 sm:py-5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-base disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="absolute right-2 sm:right-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:shadow-none"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => handleExample(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-2 rounded-xl border border-border/60 bg-card/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 leading-relaxed"
            >
              {prompt.length > 45 ? prompt.slice(0, 45) + "..." : prompt}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
