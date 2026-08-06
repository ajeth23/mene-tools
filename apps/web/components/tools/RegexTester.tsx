"use client";

import { useState } from "react";
import { Search, Info, Check, AlertCircle } from "lucide-react";

export default function RegexTester() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("gi");
  const [testText, setTestText] = useState("Send inquiries to hello@mene.app or dev-support@tools.mene.com!");

  const getMatches = () => {
    if (!pattern) return { highlights: testText, count: 0, error: "" };

    try {
      const regex = new RegExp(pattern, flags);
      const safeFlags = flags.includes("g") ? flags : flags + "g";
      const globalRegex = new RegExp(pattern, safeFlags);

      const matches = Array.from(testText.matchAll(globalRegex));
      const count = matches.length;

      // Construct visual highlights using simple markup wrapping
      if (count === 0) {
        return { highlights: testText, count: 0, error: "" };
      }

      let lastIndex = 0;
      const nodes: any[] = [];

      matches.forEach((m, i) => {
        const start = m.index!;
        const end = start + m[0].length;

        // text before match
        if (start > lastIndex) {
          nodes.push(testText.substring(lastIndex, start));
        }

        // match highlight
        nodes.push(
          `<span key=${i} class="bg-indigo-100 dark:bg-indigo-950/60 border-b border-indigo-500 font-bold px-0.5 text-indigo-700 dark:text-indigo-300 rounded-sm">${m[0]}</span>`
        );

        lastIndex = end;
      });

      if (lastIndex < testText.length) {
        nodes.push(testText.substring(lastIndex));
      }

      return { highlights: nodes.join(""), count, error: "" };
    } catch (err: any) {
      return { highlights: testText, count: 0, error: err.message || "Invalid regular expression pattern." };
    }
  };

  const { highlights, count, error } = getMatches();

  const cheatSheet = [
    { rule: "\\d", desc: "Matches any digit (0-9)" },
    { rule: "\\w", desc: "Matches any word character" },
    { rule: "[a-z]", desc: "Range match: any lowercase char" },
    { rule: "+", desc: "Quantifier: matches 1 or more times" },
    { rule: "*", desc: "Quantifier: matches 0 or more times" },
    { rule: "^", desc: "Anchor: matches start of line" },
    { rule: "$", desc: "Anchor: matches end of line" },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Regex entry */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 rounded-xl">
            <div className="sm:col-span-8 space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Pattern Regex Input
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => {
                    setPattern(e.target.value);
                  }}
                  placeholder="[a-z]+"
                  className="w-full pl-6 pr-4 py-2 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <div className="sm:col-span-4 space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Flags
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => {
                    setFlags(e.target.value);
                  }}
                  placeholder="gim"
                  className="w-full pl-4 pr-6 py-2 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">/</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 border border-red-100 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 rounded-lg text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Text Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Test Target String
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter some matchable test text here..."
                className="w-full h-64 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  Visual Match Highlights
                </label>
                <span className="text-[10px] font-mono font-bold text-indigo-500 px-2 py-0.5 rounded-full bg-indigo-55/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-950">
                  {count} {count === 1 ? "match" : "matches"} detected
                </span>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: highlights }}
                className="flex-1 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono rounded-xl overflow-y-auto whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* Cheat sheet column */}
        <div className="lg:col-span-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <Search className="w-3.5 h-3.5" />
            <span>Regex Cheat Sheet</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {cheatSheet.map((item) => (
              <div key={item.rule} className="py-2.5 flex items-start gap-3 text-xs">
                <span className="px-1.5 py-0.5 font-mono text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-indigo-600 dark:text-indigo-400 shrink-0">
                  {item.rule}
                </span>
                <span className="text-zinc-550 dark:text-zinc-400 mt-0.5">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
