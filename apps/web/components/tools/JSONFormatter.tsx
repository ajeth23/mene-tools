"use client";

import { useState } from "react";
import { Code2, Copy, Check, RefreshCw, AlertCircle, FileCode } from "lucide-react";

export default function JSONFormatter() {
  const [jsonInput, setJsonInput] = useState("");
  const [indentation, setIndentation] = useState("2");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!jsonInput.trim()) return;
    setError("");

    try {
      const parsed = JSON.parse(jsonInput);
      const space = indentation === "tab" ? "\t" : parseInt(indentation, 10);
      const formatted = JSON.stringify(parsed, null, space);
      setJsonInput(formatted);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax. Check quotes, braces, and trailing commas.");
    }
  };

  const handleMinify = () => {
    if (!jsonInput.trim()) return;
    setError("");

    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonInput(minified);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
    }
  };

  const handleCopy = () => {
    if (!jsonInput) return;
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    const sample = {
      app: "Mene Tools",
      url: "tools.mene.app",
      secure: true,
      endpoints: ["/image-compressor", "/json-formatter", "/password-generator"],
      stats: {
        totalTools: 21,
        activeRateLimit: "unlimited",
      },
    };
    setJsonInput(JSON.stringify(sample, null, 2));
    setError("");
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex gap-2">
          {(["2", "4", "tab"] as const).map((space) => (
            <button
              key={space}
              onClick={() => setIndentation(space)}
              className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                indentation === space
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {space === "tab" ? "Tabs" : `${space} Spaces`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={loadSample}
            className="text-xs text-indigo-500 hover:underline px-3 py-1 focus:outline-none cursor-pointer"
          >
            Load Sample
          </button>
          {jsonInput && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Payload
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setError("");
          }}
          placeholder='Paste your raw JSON payload here... (e.g. {"key": "value"})'
          className="w-full h-96 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
        />

        {error && (
          <div className="absolute bottom-4 left-4 right-4 flex items-start gap-2.5 px-4 py-3 border border-red-100 dark:border-red-950/30 bg-red-50/90 dark:bg-red-950/85 backdrop-blur rounded-lg text-xs text-red-600 dark:text-red-400 font-medium font-sans">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">JSON Syntax Validation Error</p>
              <p className="font-mono text-[11px] opacity-90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleFormat}
          disabled={!jsonInput.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
        >
          <Code2 className="w-4 h-4" />
          Format JSON
        </button>
        <button
          onClick={handleMinify}
          disabled={!jsonInput.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
        >
          <FileCode className="w-4 h-4" />
          Minify JSON
        </button>
      </div>
    </div>
  );
}
