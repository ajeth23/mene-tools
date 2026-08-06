"use client";

import { useState } from "react";
import { Lock, Copy, Check, RefreshCw, Key, ShieldCheck, ShieldAlert } from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const calculateStrength = (pwd: string) => {
    if (!pwd) return { label: "No Password", color: "bg-zinc-200", score: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 14) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", score };
    if (score <= 4) return { label: "Moderate", color: "bg-amber-500", score };
    return { label: "Strong & Unbreakable", color: "bg-emerald-500", score };
  };

  const generate = () => {
    let charset = "";
    if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (excludeSimilar) {
      // Remove easily confused characters: i, l, 1, L, o, 0, O, I etc.
      charset = charset.replace(/[il1Lo0OIsS5]/g, "");
    }

    if (!charset) {
      setPassword("Please check at least one character class parameter.");
      return;
    }

    let result = "";
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);

    for (let i = 0; i < length; i++) {
      result += charset[arr[i] % charset.length];
    }

    setPassword(result);
    setCopied(false);
  };

  // Run on first load
  if (!password) {
    generate();
  }

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = calculateStrength(password);

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-5">
        {/* Output pane */}
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 px-4 py-3.5 rounded-lg group relative">
          <span className="font-mono text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 break-all pr-12">
            {password}
          </span>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength indicators */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-500 uppercase font-semibold">Entropy Shield rating:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{strength.label}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-150 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${(strength.score / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Control grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500 font-semibold uppercase">Character Count length:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => {
                setLength(parseInt(e.target.value, 10));
                setTimeout(() => generate(), 0);
              }}
              className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={useUppercase}
                onChange={(e) => {
                  setUseUppercase(e.target.checked);
                  setTimeout(() => generate(), 0);
                }}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              Uppercase (A-Z)
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={useLowercase}
                onChange={(e) => {
                  setUseLowercase(e.target.checked);
                  setTimeout(() => generate(), 0);
                }}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              Lowercase (a-z)
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => {
                  setUseNumbers(e.target.checked);
                  setTimeout(() => generate(), 0);
                }}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              Numbers (0-9)
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => {
                  setUseSymbols(e.target.checked);
                  setTimeout(() => generate(), 0);
                }}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              Symbols (!@#$)
            </label>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={excludeSimilar}
              onChange={(e) => {
                setExcludeSimilar(e.target.checked);
                setTimeout(() => generate(), 0);
              }}
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            Exclude easily confused/similar characters (e.g. <span className="font-mono bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 rounded text-zinc-500">i, l, 1, o, 0, O</span>)
          </label>
        </div>
      </div>

      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Roll Fresh Password
      </button>
    </div>
  );
}
