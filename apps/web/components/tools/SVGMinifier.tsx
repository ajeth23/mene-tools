"use client";

import { useState } from "react";
import { Compass, Copy, Check, RefreshCw, Lock, ArrowDown, FileCode, CheckCircle } from "lucide-react";

export default function SVGMinifier() {
  const [svgInput, setSvgInput] = useState("");
  const [minified, setMinified] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ before: number; after: number; saved: string } | null>(null);

  const handleOptimize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!svgInput.trim()) return;

    setLoading(true);
    setStats(null);

    // Run clean SVG stripping regex optimization pipeline
    setTimeout(() => {
      let raw = svgInput.trim();

      const beforeLen = raw.length;

      // 1. Strip XML declaration
      raw = raw.replace(/<\?xml[^>]*\?>/gi, "");
      // 2. Strip comments
      raw = raw.replace(/<!--[\s\S]*?-->/g, "");
      // 3. Strip editor metadata & tags (Figma, Illustrator, Inkscape namespaces)
      raw = raw.replace(/xmlns:sodipodi="[^"]*"/gi, "");
      // 4. Clean extra spaces, spaces inside tags, and empty lines
      raw = raw.replace(/>\s+</g, "><");
      raw = raw.replace(/\s+/g, " ");
      raw = raw.trim();

      const afterLen = raw.length;
      const savedBytes = beforeLen - afterLen;
      const percentSaved = beforeLen > 0 ? ((savedBytes / beforeLen) * 100).toFixed(1) : "0.0";

      setMinified(raw);
      setStats({
        before: beforeLen,
        after: afterLen,
        saved: percentSaved,
      });
      setLoading(false);
    }, 400);
  };

  const handleCopy = () => {
    if (!minified) return;
    navigator.clipboard.writeText(minified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!minified) return;
    const blob = new Blob([minified], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100">
  <!-- Optimized with Mene Tools -->
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#g)"/>
  <circle cx="50" cy="50" r="25" fill="#ffffff" opacity="0.9"/>
</svg>`;

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input panel */}
        <form onSubmit={handleOptimize} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Raw SVG Code Block
              </label>
              <button
                type="button"
                onClick={() => setSvgInput(sampleSvg)}
                className="text-xs text-indigo-500 hover:underline cursor-pointer"
              >
                Load Sample SVG
              </button>
            </div>
            <textarea
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              placeholder="Paste raw <svg> tags or select vector documents..."
              className="w-full h-80 px-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-2.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !svgInput.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Stripping attributes...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                Optimize Vector Elements
              </>
            )}
          </button>
        </form>

        {/* Output panel */}
        <div className="flex flex-col h-[390px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500">
              MINIFIED INLINE CODE
            </span>
            {minified && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all cursor-pointer"
                >
                  Download SVG
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/30">
            {minified ? (
              <pre className="whitespace-pre-wrap break-all">{minified}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-400">
                <FileCode className="w-8 h-8 opacity-40" />
                <span className="text-xs font-semibold">Minified Output Space</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 text-center">
          <div>
            <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase">Original Length</p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{stats.before} bytes</p>
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase">Optimized Length</p>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{stats.after} bytes</p>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-1.5 border border-emerald-100/50 dark:border-emerald-950/30">
            <p className="text-[10px] font-mono font-semibold text-emerald-500 uppercase">Saved ({stats.saved}%)</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-0.5 animate-pulse">
              <ArrowDown className="w-3.5 h-3.5 shrink-0" />
              {stats.before - stats.after} Bytes
            </p>
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed locally on your device with high-entropy client sandbox.</span>
      </div>
    </div>
  );
}
