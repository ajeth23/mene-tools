"use client";

import { useState } from "react";
import { AlignLeft, RefreshCw, FileText } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  originalLineNum?: number;
  modifiedLineNum?: number;
}

export default function DiffChecker() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);

  const handleCompare = () => {
    const origLines = original.split("\n");
    const modLines = modified.split("\n");

    const diffs: DiffLine[] = [];
    let o = 0;
    let m = 0;

    // Execute real line-by-line comparison heuristic
    while (o < origLines.length || m < modLines.length) {
      const origLine = origLines[o];
      const modLine = modLines[m];

      if (origLine === modLine) {
        if (o < origLines.length) {
          diffs.push({
            type: "unchanged",
            content: origLine,
            originalLineNum: o + 1,
            modifiedLineNum: m + 1,
          });
        }
        o++;
        m++;
      } else {
        // Line added or removed: look ahead to find matches
        const lookAheadMod = modLines.slice(m).indexOf(origLine);
        const lookAheadOrig = origLines.slice(o).indexOf(modLine);

        if (lookAheadMod !== -1 && (lookAheadOrig === -1 || lookAheadMod < lookAheadOrig)) {
          // Lines added to modified
          for (let i = 0; i < lookAheadMod; i++) {
            diffs.push({
              type: "added",
              content: modLines[m + i],
              modifiedLineNum: m + i + 1,
            });
          }
          m += lookAheadMod;
        } else if (lookAheadOrig !== -1 && (lookAheadMod === -1 || lookAheadOrig <= lookAheadMod)) {
          // Lines removed from original
          for (let i = 0; i < lookAheadOrig; i++) {
            diffs.push({
              type: "removed",
              content: origLines[o + i],
              originalLineNum: o + i + 1,
            });
          }
          o += lookAheadOrig;
        } else {
          // Line substituted: treat as one removal and one addition
          if (o < origLines.length) {
            diffs.push({
              type: "removed",
              content: origLine,
              originalLineNum: o + 1,
            });
            o++;
          }
          if (m < modLines.length) {
            diffs.push({
              type: "added",
              content: modLine,
              modifiedLineNum: m + 1,
            });
            m++;
          }
        }
      }
    }

    setDiffResult(diffs);
  };

  const loadSample = () => {
    setOriginal(`const port = 3000;
console.log("Starting service...");
const config = {
  secure: true,
  theme: "dark"
};`);

    setModified(`const port = 3000;
console.log("Starting unified platform...");
const config = {
  secure: true,
  theme: "light",
  version: "1.0.4"
};`);
    setDiffResult([]);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-3">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
          LINE-BY-LINE DELTAS
        </span>
        <button
          onClick={loadSample}
          className="text-xs text-indigo-500 hover:underline px-2.5 py-0.5 focus:outline-none cursor-pointer"
        >
          Load Code Sample
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
            Original Text Block
          </label>
          <textarea
            value={original}
            onChange={(e) => {
              setOriginal(e.target.value);
              setDiffResult([]);
            }}
            placeholder="Paste your baseline text..."
            className="w-full h-44 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
            Modified Text Block
          </label>
          <textarea
            value={modified}
            onChange={(e) => {
              setModified(e.target.value);
              setDiffResult([]);
            }}
            placeholder="Paste your changed/modified text..."
            className="w-full h-44 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!original.trim() && !modified.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
      >
        <AlignLeft className="w-4 h-4" />
        Analyze Code Changes
      </button>

      {diffResult.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500">
              MERGED DIFF SHEET
            </span>
          </div>

          <div className="font-mono text-xs overflow-x-auto divide-y divide-zinc-100 dark:divide-zinc-850/40 bg-zinc-50/10 dark:bg-zinc-950/10 max-h-96">
            {diffResult.map((line, idx) => {
              let bg = "bg-transparent text-zinc-700 dark:text-zinc-300";
              let prefix = " ";
              if (line.type === "added") {
                bg = "bg-emerald-50/40 dark:bg-emerald-950/15 text-emerald-700 dark:text-emerald-400 font-bold border-l-2 border-emerald-500";
                prefix = "+";
              } else if (line.type === "removed") {
                bg = "bg-red-50/40 dark:bg-red-950/15 text-red-700 dark:text-red-400 font-bold border-l-2 border-red-500";
                prefix = "-";
              }

              return (
                <div key={idx} className={`py-2 px-4 flex items-start gap-4 ${bg}`}>
                  <div className="flex gap-2 text-[10px] text-zinc-400 font-mono w-10 shrink-0 select-none">
                    <span className="text-right w-4">{line.originalLineNum || ""}</span>
                    <span className="text-right w-4">{line.modifiedLineNum || ""}</span>
                  </div>
                  <span className="w-3 select-none text-zinc-400 font-bold">{prefix}</span>
                  <pre className="flex-1 whitespace-pre-wrap break-all leading-relaxed font-semibold">
                    {line.content}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
