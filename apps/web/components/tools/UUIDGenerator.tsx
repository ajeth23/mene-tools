"use client";

import { useState } from "react";
import { Hash, Copy, Check, Download, RefreshCw, Sparkles } from "lucide-react";

export default function UUIDGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateUUIDs = () => {
    const list: string[] = [];
    const limit = Math.min(Math.max(quantity, 1), 1000);

    for (let i = 0; i < limit; i++) {
      // Cryptographically secure random UUID v4 calculation
      let uuid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );

      if (noHyphens) {
        uuid = uuid.replace(/-/g, "");
      }
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }

      list.push(uuid);
    }

    setUuids(list);
  };

  // Generate on load if empty
  if (uuids.length === 0) {
    generateUUIDs();
  }

  const handleCopy = () => {
    if (uuids.length === 0) return;
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (uuids.length === 0) return;
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 rounded-xl">
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500 font-semibold uppercase">Quantity to Generate:</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">{quantity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex flex-wrap gap-4 justify-end">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            Uppercase Case
          </label>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={noHyphens}
              onChange={(e) => setNoHyphens(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            Remove Hyphens
          </label>
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-500">GENERATED IDENTIFIERS</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : "Copy All"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download List
            </button>
          </div>
        </div>

        <div className="p-4 bg-zinc-50/20 dark:bg-zinc-950/20 font-mono text-xs max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-850">
          {uuids.map((uuid, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between gap-4 group">
              <span className="text-zinc-850 dark:text-zinc-250 font-semibold">{uuid}</span>
              <span className="text-[10px] text-zinc-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={generateUUIDs}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Regenerate UUIDs
      </button>
    </div>
  );
}
