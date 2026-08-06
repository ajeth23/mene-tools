"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Download, RefreshCw, Lock, Sliders, CheckCircle } from "lucide-react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [text, setText] = useState("https://tools.mene.app");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateQR = async () => {
    if (!text.trim() || !canvasRef.current) return;
    setError("");
    setSuccess(false);

    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 4,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to compile vector QR layout matrix.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR();
    }, 0);
    return () => clearTimeout(timer);
  }, [text, fgColor, bgColor, size]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qrcode_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccess(true);
    } catch (err) {
      setError("Failed to download QR code image.");
    }
  };

  const colorSwatches = [
    { fg: "#000000", bg: "#ffffff", label: "Classic Black" },
    { fg: "#4f46e5", bg: "#ffffff", label: "Midnight Indigo" },
    { fg: "#0284c7", bg: "#ffffff", label: "Ocean Teal" },
    { fg: "#18181b", bg: "#f4f4f5", label: "Minimalist Slate" },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
              Content Link or text payload
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. https://github.com/or-some-link"
              className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Foreground Color (Dark)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Background Color (Light)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3.5 border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>Presets & Swatches</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {colorSwatches.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className="p-2 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-left text-[10px] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <div className="flex shrink-0">
                    <div className="w-3.5 h-3.5 rounded-l-md" style={{ backgroundColor: preset.fg }} />
                    <div className="w-3.5 h-3.5 rounded-r-md border-l border-zinc-200" style={{ backgroundColor: preset.bg }} />
                  </div>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-450 truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Canvas Preview Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm text-center">
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/25 shadow-sm max-w-full">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" style={{ width: "240px", height: "240px" }} />
          </div>

          <p className="text-[10px] font-mono text-zinc-400 mt-4">
            Size: {size} x {size} px • PNG Asset Matrix
          </p>

          {error && (
            <p className="text-xs text-red-500 font-mono mt-3">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-3">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>QR code downloaded!</span>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 mt-5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download QR PNG
          </button>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed locally on your device with high-entropy client sandbox.</span>
      </div>
    </div>
  );
}
