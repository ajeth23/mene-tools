"use client";

import { useState, useEffect } from "react";
import { Sparkles, Copy, Check, RefreshCw, PenTool, MessageSquare, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAIUsage, UsageStatus } from "../../lib/ai-limit";
import { callAIGateway } from "../../lib/ai-service";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function AITextGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [format, setFormat] = useState("article");
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please specify a topic or writing outline first.");
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
      const systemInstruction = `You are a world-class professional writer. Generate a premium quality ${format || "article"} in a ${tone || "professional"} tone of approximately ${length || "medium"} length. Output strictly clean markdown, focusing on rich vocabulary, perfect structure, and engaging hooks.`;
      const prompt = `Write about the following topic in depth: "${topic}". Make sure the output is beautifully formatted in markdown.`;

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

  const samplePrompts = [
    "The future of quantum computing in next-generation cybersecurity",
    "A persuasive product landing page copy for a luxury minimalist mechanical keyboard",
    "An expert guide summarizing standard design principles of Vercel, Apple, and Linear",
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
              Topic or Writing Outline
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe what you want to write about in detail (e.g. 'A newsletter explaining standard SaaS caching rules'...)"
              className="w-full h-32 px-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 py-2.5 resize-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
              >
                <option value="professional">💼 Professional</option>
                <option value="creative">🎨 Creative</option>
                <option value="informative">📖 Academic / Informative</option>
                <option value="minimalist">📝 Plain & Direct</option>
                <option value="persuasive">🔥 Highly Persuasive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
              >
                <option value="article">Article / Essay</option>
                <option value="landing page copy">Landing Page Copy</option>
                <option value="email newsletter">Email Newsletter</option>
                <option value="blog post">Blog Post</option>
                <option value="outline">Structured Outline</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
              Target Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["short", "medium", "long"] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setLength(len)}
                  className={`py-1.5 rounded-lg border text-xs capitalize font-medium transition-all cursor-pointer ${
                    length === len
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {len}
                </button>
              ))}
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
            disabled={loading || usage.remaining <= 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Synthesizing copy...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Premium Copy
              </>
            )}
          </button>

          {/* Quick Ideas */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-2.5">
            <p className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              Inspiration Ideas
            </p>
            <div className="space-y-1.5">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTopic(p)}
                  className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors truncate focus:outline-none"
                >
                  → {p}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Output Column */}
        <div className="lg:col-span-7 flex flex-col h-[520px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono font-semibold text-zinc-500">
                PROPOSAL RENDERED VIEW
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
                    Copy MD
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
                  Synthesizing with Groq AI...
                </p>

              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="markdown-body prose dark:prose-invert prose-zinc max-w-none text-zinc-800 dark:text-zinc-200 text-sm">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <FeedbackWidget toolName="AI Text Generator" />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider">
                    Idle Slate
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Set writing options and click Generate to see premium generated text render.
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
