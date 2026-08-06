"use client";

import { useState } from "react";
import { Eye, Edit3, Copy, Check, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    const sample = `# Premium Markdown Sandbox

This is a dynamic markdown compiler powered by **Mene Tools**.

## Visual Elements

-   **Bold Weights** or *Slanted Text*
-   Structured inline codes: \`const app = "mene"\`
-   Clean separators:

---

### Code Blueprint Sample

\`\`\`typescript
interface Config {
  secure: boolean;
  algorithm: "HS256" | "RS256";
}
\`\`\`

> "Craft is the absence of noise, executed with immaculate detail." - Linear Manifesto
`;
    setMarkdown(sample);
  };

  if (!markdown) {
    loadSample();
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
          LIVE MD COMPILER
        </span>
        <div className="flex gap-2">
          <button
            onClick={loadSample}
            className="text-xs text-indigo-500 hover:underline px-2.5 py-0.5 focus:outline-none cursor-pointer"
          >
            Load Sample Template
          </button>
          {markdown && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 py-0.5 px-2.5 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : "Copy Markdown"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[460px]">
        {/* Editor Pane */}
        <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-55/40 dark:bg-zinc-950/20 flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-mono font-semibold text-zinc-500">RAW MARKDOWN WRITER</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write standard markdown headers, quotes, lists, or codeblocks here..."
            className="flex-1 w-full p-4 text-xs font-mono border-none bg-transparent focus:outline-none resize-none transition-all text-zinc-900 dark:text-zinc-50 leading-relaxed"
          />
        </div>

        {/* Compiled visual layout */}
        <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-55/40 dark:bg-zinc-950/20 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-mono font-semibold text-zinc-500">HTML5 RENDER SHEET</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-zinc-50/20 dark:bg-zinc-950/10">
            <div className="markdown-body prose dark:prose-invert prose-zinc max-w-none text-zinc-800 dark:text-zinc-200 text-sm">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
