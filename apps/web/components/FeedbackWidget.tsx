"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";

interface FeedbackWidgetProps {
  toolName?: string;
}

export default function FeedbackWidget({ toolName = "Utility Tool" }: FeedbackWidgetProps) {
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null);

  const mailtoBug = `mailto:contact@mene.app?subject=Mene Tools Bug Report - ${encodeURIComponent(toolName)}&body=Hi support team,%0A%0AI was using the ${encodeURIComponent(toolName)} tool and encountered the following issue:%0A%0A[Please describe the issue here...]`;
  const mailtoFeature = `mailto:contact@mene.app?subject=Mene Tools Feature Suggestion - ${encodeURIComponent(toolName)}&body=Hi support team,%0A%0AI would like to suggest a feature or improvement for the ${encodeURIComponent(toolName)} tool:%0A%0A[Describe your idea here...]`;

  if (voted) {
    return (
      <div className="flex flex-col space-y-1.5 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>
            {voted === "like"
              ? "Thank you for your feedback! We're glad this tool helped."
              : "Feedback recorded. Help us fix it:"}
          </span>
        </div>
        {voted === "dislike" && (
          <div className="flex flex-wrap items-center gap-x-2 text-[9px] font-mono font-bold text-zinc-450 dark:text-zinc-550">
            <a href={mailtoBug} className="text-[#0052FF] dark:text-[#38bdf8] hover:underline">
              REPORT A BUG
            </a>
            <span>•</span>
            <a href={mailtoFeature} className="text-[#0052FF] dark:text-[#38bdf8] hover:underline">
              SUGGEST A FEATURE
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 animate-[fadeIn_0.3s_ease-out]">
      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
        Was this helpful?
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setVoted("like")}
          className="inline-flex items-center gap-1 px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md text-[10px] font-bold text-zinc-600 dark:text-zinc-350 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all cursor-pointer focus:outline-none"
        >
          <ThumbsUp className="w-3 h-3" />
          <span>Yes</span>
        </button>
        <button
          onClick={() => setVoted("dislike")}
          className="inline-flex items-center gap-1 px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md text-[10px] font-bold text-zinc-600 dark:text-zinc-350 hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/10 dark:hover:bg-rose-950/10 transition-all cursor-pointer focus:outline-none"
        >
          <ThumbsDown className="w-3 h-3" />
          <span>No</span>
        </button>
      </div>
    </div>
  );
}
