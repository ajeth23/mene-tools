"use client";

import { useState } from "react";
import { Binary, Copy, Check, RefreshCw, Lock } from "lucide-react";

export default function Base64Tool() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState<"input" | "output" | "">("");

  const handleEncode = (text: string) => {
    setInputText(text);
    if (!text) {
      setOutputText("");
      return;
    }
    try {
      const encoded = btoa(unescape(encodeURIComponent(text)));
      setOutputText(encoded);
    } catch (e) {
      setOutputText("Encoding error occurred.");
    }
  };

  const handleDecode = (base64: string) => {
    setOutputText(base64);
    if (!base64) {
      setInputText("");
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(base64.trim())));
      setInputText(decoded);
    } catch (e) {
      setInputText("Invalid Base64 string payload detected.");
    }
  };

  const handleCopy = (section: "input" | "output") => {
    const text = section === "input" ? inputText : outputText;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(""), 2000);
  };

  const inputBytes = new Blob([inputText]).size;
  const outputBytes = new Blob([outputText]).size;

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Text Pane (Plaintext) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
              Plain Text UTF-8
            </label>
            {inputText && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span>{inputBytes} bytes</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleCopy("input")}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  {copied === "input" ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => handleEncode(e.target.value)}
            placeholder="Type or paste plain text here to encode..."
            className="w-full h-80 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
          />
        </div>

        {/* Output Text Pane (Base64) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
              Base64 Encoded RFC 4648
            </label>
            {outputText && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span>{outputBytes} bytes</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleCopy("output")}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  {copied === "output" ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <textarea
            value={outputText}
            onChange={(e) => handleDecode(e.target.value)}
            placeholder="Paste Base64 encoded string here to decode..."
            className="w-full h-80 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3.5 resize-none transition-all text-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-4 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Bi-directional live translations. Changes compile on keypress.</span>
        </div>
        <button
          onClick={() => {
            setInputText("");
            setOutputText("");
          }}
          className="text-[11px] text-red-500 hover:underline cursor-pointer"
        >
          Reset Panes
        </button>
      </div>
    </div>
  );
}
