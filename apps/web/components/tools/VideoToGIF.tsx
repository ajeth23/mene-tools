"use client";

import { useState, useRef } from "react";
import { Film, Upload, FileVideo, CheckCircle, RefreshCw, Lock, Sliders, Image as ImageIcon } from "lucide-react";

interface ExtractedFrame {
  id: string;
  url: string;
  time: string;
}

export default function VideoToGIF() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [fps, setFps] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (!f.type.startsWith("video/")) {
      setError("Please select a valid video file (e.g. MP4, WebM).");
      return;
    }

    setFile(f);
    setError("");
    setSuccess(false);
    setFrames([]);

    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  };

  const handleExtract = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setLoading(true);
    setError("");
    setSuccess(false);
    setFrames([]);

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context.");

      // Frame dimensions matching video bounds
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 360;
      canvas.width = w;
      canvas.height = h;

      const duration = video.duration;
      const interval = 1 / fps;
      const extractedList: ExtractedFrame[] = [];

      // Seek frames sequentially
      for (let time = 0; time < duration; time += interval) {
        if (extractedList.length >= 12) break; // Limit to first 12 frames to prevent browser memory leaks
        video.currentTime = time;

        await new Promise<void>((resolve) => {
          const seeked = () => {
            video.removeEventListener("seeked", seeked);
            resolve();
          };
          video.addEventListener("seeked", seeked);
        });

        // Draw seeked frame on canvas
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/png");

        extractedList.push({
          id: Math.random().toString(36).substring(2, 9),
          url: dataUrl,
          time: `${time.toFixed(1)}s`,
        });
      }

      setFrames(extractedList);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to seek and capture video frames.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFrame = (frameUrl: string, idx: number) => {
    const a = document.createElement("a");
    a.href = frameUrl;
    a.download = `frame_${idx + 1}_${file?.name.substring(0, file.name.lastIndexOf(".")) || "capture"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 font-sans">
      {!file ? (
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 text-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Upload Target Video Clip
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload clips to extract keyframe layers locally. No server streams.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <FileVideo className="w-8 h-8 text-indigo-500" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB Detected
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setVideoUrl("");
                setFrames([]);
                setSuccess(false);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline focus:outline-none cursor-pointer"
            >
              Reset Clip
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Embedded video player reference */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">Video Player Seek reference</label>
              <div className="border border-zinc-200 dark:border-zinc-850 bg-black rounded-xl overflow-hidden shadow-md max-h-[220px] flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full h-auto max-h-[220px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-450 uppercase font-semibold">Sampling Frequency (FPS):</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{fps} frames/sec</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={fps}
                  onChange={(e) => {
                    setFps(parseInt(e.target.value, 10));
                    setSuccess(false);
                  }}
                  className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 p-3.5 rounded-xl text-[11px] text-zinc-400 leading-relaxed">
                Extraction uses high-fidelity canvas sampling of the browser decode thread. Max 12 frames extracted per process to protect browser thread pool safety.
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {error && (
            <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
              {error}
            </p>
          )}

          {success && (
            <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Keyframes compiled successfully! Select target frames to download below.</span>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Slicing video frame layers...
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                Decompile Keyframe Sheets
              </>
            )}
          </button>

          {/* Render Extracted Frames Grid */}
          {frames.length > 0 && (
            <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800/85 pt-5">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">EXTRACTED SEGMENTS</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {frames.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleDownloadFrame(item.url, index)}
                    className="border border-zinc-150 dark:border-zinc-850 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-1.5 cursor-pointer hover:border-indigo-500 transition-colors group relative"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black relative">
                      <img src={item.url} alt={`Frame ${index}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] font-mono font-bold text-white uppercase">
                        {item.time}
                      </span>
                    </div>
                    <div className="mt-2 px-1 flex items-center justify-between text-[11px] font-medium text-zinc-500 group-hover:text-indigo-500">
                      <span>Frame #{index + 1}</span>
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed locally on your device with direct hardware decoding.</span>
      </div>
    </div>
  );
}
