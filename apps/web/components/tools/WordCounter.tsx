"use client";

import { useState } from "react";
import { ListCollapse, Timer, Sparkles, Layers } from "lucide-react";

export default function WordCounter() {
  const [text, setText] = useState("");

  const getStats = () => {
    const raw = text || "";
    const charCount = raw.length;
    const charNoSpaces = raw.replace(/\s/g, "").length;

    // Word parsing
    const words = raw.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // Paragraph count
    const paragraphs = raw.split(/\n+/).filter((p) => p.trim().length > 0).length;

    // Sentence count
    const sentences = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    // Estimated read & speak times
    const readMins = Math.ceil(wordCount / 200); // 200 WPM
    const speakMins = Math.ceil(wordCount / 130); // 130 WPM

    // Top keyword frequencies
    const freq: { [key: string]: number } = {};
    const ignoredWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "of", "is", "are", "was", "were", "it", "this", "that", "i", "you", "we", "they", "he", "she"]);

    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      if (clean.length > 2 && !ignoredWords.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      charCount,
      charNoSpaces,
      wordCount,
      paragraphs,
      sentences,
      readTime: wordCount === 0 ? "0 mins" : `${readMins} ${readMins === 1 ? "min" : "mins"}`,
      speakTime: wordCount === 0 ? "0 mins" : `${speakMins} ${speakMins === 1 ? "min" : "mins"}`,
      topKeywords,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Area */}
        <div className="lg:col-span-8 space-y-2">
          <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
            Pasted Text Payload
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type, paste, or inspect articles here..."
            className="w-full h-80 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
          />
        </div>

        {/* Real-time stats panels */}
        <div className="lg:col-span-4 space-y-5">
          {/* Main counts */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <Layers className="w-3.5 h-3.5" />
              <span>Metrics & Metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">Words</p>
                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{stats.wordCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">Characters</p>
                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{stats.charCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">No Spaces</p>
                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{stats.charNoSpaces}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">Paragraphs</p>
                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{stats.paragraphs}</p>
              </div>
            </div>
          </div>

          {/* Timing indicators */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <Timer className="w-3.5 h-3.5" />
              <span>Estimated Delivery</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 font-mono">Silent Reading (200 WPM):</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.readTime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 font-mono">Speach Delivery (130 WPM):</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.speakTime}</span>
            </div>
          </div>

          {/* Keyword density */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top SEO Keywords</span>
            </div>

            {stats.topKeywords.length > 0 ? (
              <div className="space-y-2">
                {stats.topKeywords.map(([word, count]) => (
                  <div key={word} className="flex justify-between text-xs items-center">
                    <span className="font-mono bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 rounded font-bold text-zinc-650 dark:text-zinc-350">
                      {word}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400 font-bold">{count} occurrences</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-400 font-mono text-center py-2">
                Begin typing to assess token frequency list metrics.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
