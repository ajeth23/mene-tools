"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Copy, Check, RefreshCw, Terminal, Sliders, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAIUsage, UsageStatus } from "../../lib/ai-limit";
import { callAIGateway } from "../../lib/ai-service";

export default function AIPromptGenerator() {
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState("general");
  const [targetModel, setTargetModel] = useState("Llama 3.3 (Groq)");
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
    if (!idea.trim()) {
      setError("Please outline your prompt goal or raw idea first.");
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
      const systemInstruction = "You are a senior prompt engineer. Expand the user's basic idea into an extremely powerful, structured, role-based, context-rich prompt that will get the absolute best performance from large language models. Format the output with clear sections (Role, Context, Instructions, Constraints, Examples).";
      const prompt = `Generate a master prompt for a ${category || "general"} task based on this raw idea: "${idea}". Optimize this prompt specifically for ${targetModel || "Llama 3.3"}.`;

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

  const templates = [
    { name: "Code Debugger", text: "Create a bot that inspects Next.js typescript memory leak leaks" },
    { name: "Copy Editor", text: "Proofread my newsletters to sound like Steve Jobs or Paul Graham" },
    { name: "Finance Advisory", text: "Create a spreadsheet formula helper calculating complex amortizations" },
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
              Raw Idea or Prompt Goal
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="What is your ultimate AI goal? (e.g. 'A code generator that outputs responsive Tailwind tables from a schema description'...)"
              className="w-full h-32 px-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 py-2.5 resize-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Core Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
              >
                <option value="software-development">💻 Coding & Dev</option>
                <option value="copywriting">✍️ Copywriting / Marketing</option>
                <option value="data-analysis">📊 Business & Finance</option>
                <option value="general">🌍 General Purpose</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Target Model
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
              >
                <option value="Llama 3.3 (Groq)">Llama 3.3 (Groq)</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                <option value="ChatGPT (GPT-4o)">GPT-4o</option>
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
            disabled={loading || usage.remaining <= 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Refining specifications...
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                Formulate Master Prompt
              </>
            )}
          </button>

          {/* Templates list */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Prompt Starters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {templates.map((temp) => (
                <button
                  key={temp.name}
                  type="button"
                  onClick={() => setIdea(temp.text)}
                  className="px-2.5 py-1 text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium rounded-md transition-colors text-left focus:outline-none"
                >
                  {temp.name}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Output Column */}
        <div className="lg:col-span-7 flex flex-col h-[520px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono font-semibold text-zinc-500">
                MASTER PROMPT CODE BLOCK
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
                    Copy Prompt
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
                  Structuring systems payload...
                </p>
              </div>
            ) : result ? (
              <div className="markdown-body prose dark:prose-invert prose-zinc max-w-none text-zinc-800 dark:text-zinc-200 text-sm">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider">
                    Ready to engineer
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Provide your baseline idea on the left, then click Formulate to generate master prompts.
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
