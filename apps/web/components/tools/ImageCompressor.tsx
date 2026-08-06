"use client";

import { useState, useRef, useEffect } from "react";
import { ImageDown, Upload, CheckCircle, RefreshCw, Lock, Sliders, ArrowDown, Download, Check } from "lucide-react";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [compressedPreview, setCompressedPreview] = useState<string>("");
  const [quality, setQuality] = useState<number>(80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<{ original: string; compressed: string; percent: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (!f.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setFile(f);
    setError("");
    setSuccess(false);
    setStats(null);
    setCompressedPreview("");

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  // Run in-memory compression in background
  const runCompression = (qVal: number) => {
    if (!file || !preview) return;
    setLoading(true);

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setLoading(false);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setLoading(false);
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Convert to target compressed type
        const targetType = file.type === "image/png" ? "image/jpeg" : file.type;
        const compressedDataUrl = canvas.toDataURL(targetType, qVal / 100);

        // Calculate size
        const header = `data:${targetType};base64,`;
        const stringLength = compressedDataUrl.length - header.length;
        const sizeInBytes = Math.floor(stringLength * 0.75);
        const percentSaved = (((file.size - sizeInBytes) / file.size) * 100).toFixed(1);

        setCompressedPreview(compressedDataUrl);
        setStats({
          original: formatSize(file.size),
          compressed: formatSize(sizeInBytes),
          percent: parseFloat(percentSaved) > 0 ? percentSaved : "0.0",
        });
        setLoading(false);
      };
      img.src = preview;
    } catch (err) {
      console.error(err);
      setError("Failed to process preview compression.");
      setLoading(false);
    }
  };

  // Auto-compress when file loads or quality changes
  useEffect(() => {
    if (file && preview) {
      const timer = setTimeout(() => {
        runCompression(quality);
      }, 150); // small debounce to keep dragging smooth
      return () => clearTimeout(timer);
    }
  }, [preview, quality, file]);

  const handleDownload = () => {
    if (!compressedPreview || !file) return;
    setSuccess(false);

    try {
      const fileExt = file.type === "image/png" ? "jpg" : file.name.split(".").pop();
      const a = document.createElement("a");
      a.href = compressedPreview;
      a.download = `compressed_${file.name.substring(0, file.name.lastIndexOf(".")) || file.name}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccess(true);
    } catch (err) {
      setError("Download failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {!file ? (
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 text-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Upload Target Image
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Optimizes JPEGs, PNGs, and WebPs. Stay completely secure on your machine.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                <img src={preview} alt="Mini preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Original: {(file.size / 1024).toFixed(1)} KB Detected
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPreview("");
                setCompressedPreview("");
                setSuccess(false);
                setStats(null);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline focus:outline-none cursor-pointer"
            >
              Reset Image
            </button>
          </div>

          {/* Side-by-side Visual Comparison Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Original Preview */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-550">
                <span>Original Image</span>
                <span>{stats?.original || `${(file.size / 1024).toFixed(1)} KB`}</span>
              </div>
              <div className="aspect-video bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden flex items-center justify-center p-2">
                <img src={preview} alt="Original comparison" className="max-h-full object-contain shadow-sm rounded" />
              </div>
            </div>

            {/* Compressed Preview */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                <span>Compressed Preview</span>
                <span>{stats ? `${stats.compressed} (-${stats.percent}%)` : "Rendering..."}</span>
              </div>
              <div className="aspect-video bg-zinc-50 dark:bg-zinc-950 border border-indigo-100 dark:border-indigo-950/20 rounded-xl overflow-hidden flex items-center justify-center p-2 relative">
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="text-[9px] font-mono uppercase">Optimizing quality...</span>
                  </div>
                ) : compressedPreview ? (
                  <img src={compressedPreview} alt="Compressed preview" className="max-h-full object-contain shadow-sm rounded" />
                ) : (
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* Parameters Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-450 dark:text-zinc-550">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Compression Parameters</span>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-xl space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-500">Target quality level:</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{quality}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={quality}
                onChange={(e) => {
                  setQuality(parseInt(e.target.value, 10));
                  setSuccess(false);
                }}
                className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-450 dark:text-zinc-550 font-mono">
                <span>Smallest File (Higher Compression)</span>
                <span>Highest Quality (Original Detail)</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
              {error}
            </p>
          )}

          {success && (
            <>
              <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-[fadeIn_0.2s_ease-out]">
                <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />
                <span>Image compressed and downloaded successfully!</span>
              </div>
              <FeedbackWidget toolName="Image Compressor" />
            </>
          )}

          <button
            onClick={handleDownload}
            disabled={loading || !compressedPreview}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Compressed Image</span>
          </button>
        </div>
      )}

      {/* Hidden Canvas used for compression */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed locally on your device with high-entropy client sandbox.</span>
      </div>
    </div>
  );
}
