"use client";

import { useState, useEffect } from "react";
import { FileText, Copy, Check, RefreshCw, BarChart2, ShieldCheck, FileType } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAIUsage, UsageStatus } from "../../lib/ai-limit";
import { callAIGateway } from "../../lib/ai-service";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function AISummarizer() {
  const [text, setText] = useState("");
  const [targetLength, setTargetLength] = useState("concise");
  const [format, setFormat] = useState("bulleted list");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<UsageStatus>({ count: 0, limit: 3, remaining: 3 });

  useEffect(() => {
    setTimeout(() => {
      setUsage(getAIUsage());
    }, 0);
  }, []);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please paste some text content to summarize.");
      return;
    }

    const currentUsage = getAIUsage();
    if (currentUsage.remaining <= 0) {
      setError("You have reached your limit of 3 free generations for today. Please try again tomorrow!");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const systemInstruction = "You are a expert editor. Extract key concepts, critical arguments, and actionable takeaways from the provided text. Provide a dense, elegant summary. Output clean markdown.";
      const prompt = `Summarize the following text into a ${targetLength || "concise"} ${format || "bulleted list"}:\n\n${text}`;

      const generatedResult = await callAIGateway(prompt, systemInstruction);
      
      setResult(generatedResult);
      setUsage(getAIUsage());
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word & Character count helpers
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estReadTime = Math.ceil(wordCount / 200); // 200 wpm

  return (
    <div className="space-y-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-6 space-y-4">
          <form
            onSubmit={handleSummarize}
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-5"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  Target Text Payload
                </label>
                {wordCount > 0 && (
                  <div className="flex gap-2 text-[10px] font-mono text-zinc-400">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} chars</span>
                    <span>•</span>
                    <span>~{estReadTime}m read</span>
                  </div>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your long article, transcript, or document here to synthesize key takeaways..."
                className="w-full h-80 px-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 py-2.5 resize-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  Style Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
                >
                  <option value="bulleted list">🎯 Actionable Bullets</option>
                  <option value="executive summary">📝 Executive Paragraph</option>
                  <option value="structural outline">📁 Structured Outline</option>
                  <option value="key takeaways">💡 Quick Key Takeaways</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  Summary Density
                </label>
                <select
                  value={targetLength}
                  onChange={(e) => setTargetLength(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
                >
                  <option value="ultra-short">Concise (1-3 key ideas)</option>
                  <option value="concise">Balanced (Medium Density)</option>
                  <option value="detailed">Comprehensive / Detailed</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
                {error}
              </p>
            )}

            <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <span>Daily AI Quota:</span>
              <span className={`font-semibold ${usage.remaining === 0 ? "text-amber-500" : "text-zinc-600 dark:text-zinc-300"}`}>
                {usage.remaining} of {usage.limit} free left today
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim() || usage.remaining <= 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synthesizing report...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Summarize Document
                </>
              )}
            </button>
          </form>

          {/* Verification indicator */}
          <div className="flex items-center gap-2 px-4 py-3 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              100% Secure & Private: Payload sizes are processed completely inside active TLS channels and not stored or indexed.
            </span>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-6 flex flex-col h-[520px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono font-semibold text-zinc-500">
                DENSE SYNTHESIS REPORT
              </span>
            </div>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy summary
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"></div>
                </div>
                <p className="text-xs font-mono text-zinc-400 animate-pulse">
                  Analyzing document structure...
                </p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="markdown-body prose dark:prose-invert prose-zinc max-w-none text-zinc-800 dark:text-zinc-200 text-sm">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <FeedbackWidget toolName="AI Summarizer" />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400">
                  <FileType className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider">
                    No Input Detected
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Paste some research notes or standard articles on the left, then click Summarize.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
