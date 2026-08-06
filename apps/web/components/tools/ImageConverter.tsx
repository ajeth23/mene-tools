"use client";

import { useState, useRef } from "react";
import { RefreshCw, Upload, CheckCircle, Lock, ArrowRight, Download, Image as ImageIcon } from "lucide-react";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<"png" | "jpeg" | "webp" | "gif">("webp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleConvert = () => {
    if (!file || !preview) return;
    setLoading(true);
    setError("");
    setSuccess(false);

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

        // Draw background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Map target mimeType
        const mimeTypes = {
          png: "image/png",
          jpeg: "image/jpeg",
          webp: "image/webp",
          gif: "image/gif",
        };

        const mime = mimeTypes[targetFormat];
        const convertedDataUrl = canvas.toDataURL(mime, 0.92);

        // Download
        const a = document.createElement("a");
        a.href = convertedDataUrl;
        a.download = `${file.name.substring(0, file.name.lastIndexOf(".")) || file.name}.${targetFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setSuccess(true);
        setLoading(false);
      };

      img.src = preview;
    } catch (err: any) {
      setError("Failed to convert this image format. Please try another format.");
      setLoading(false);
    }
  };

  const sourceFormat = file ? file.name.split(".").pop()?.toUpperCase() : "";

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
                Upload image assets to cross-transcode. Stay completely secure on your machine.
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
                setSuccess(false);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline focus:outline-none cursor-pointer"
            >
              Reset Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Visual Cover Preview Card */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl relative aspect-video md:aspect-[4/3] overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Source image preview"
                  className="w-full h-full object-contain bg-white dark:bg-zinc-900 shadow-sm rounded"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 h-full">
                  <ImageIcon className="w-8 h-8 animate-pulse" />
                  <span className="text-[10px] font-mono mt-2 uppercase tracking-wide">
                    Loading preview...
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Parameters and Transcoding Status */}
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-450 dark:text-zinc-550">
                    Select Target Format
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["webp", "png", "jpeg", "gif"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setTargetFormat(fmt);
                          setSuccess(false);
                        }}
                        className={`py-2 rounded-lg border text-xs uppercase font-medium tracking-wider transition-all cursor-pointer ${
                          targetFormat === fmt
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-sm"
                            : "bg-zinc-50 dark:bg-zinc-955 text-zinc-650 dark:text-zinc-350 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual flow indicator */}
              <div className="flex items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl p-4">
                <div className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase shrink-0">
                  {sourceFormat}
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 shrink-0" />
                <div className="px-3 py-1.5 bg-indigo-500 text-white rounded text-xs font-mono font-bold uppercase shrink-0">
                  {targetFormat}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
                  {error}
                </p>
              )}

              {success && (
                <>
                  <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Transcoded successfully to {targetFormat.toUpperCase()}! Download triggered.</span>
                  </div>
                  <FeedbackWidget toolName="Image Converter" />
                </>
              )}

              <button
                onClick={handleConvert}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transcoding canvas buffer...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Convert and Download Asset</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
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
