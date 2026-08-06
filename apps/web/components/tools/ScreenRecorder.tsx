"use client";

import { useState, useRef, useEffect } from "react";
import { Video, Square, Download, CheckCircle, Lock, RefreshCw } from "lucide-react";

export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStart = async () => {
    setError("");
    setSuccess(false);
    chunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Display Capture APIs are not fully supported on this web client.");
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
        audio: true,
      });

      const recorder = new MediaRecorder(displayStream, { mimeType: "video/webm" });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        displayStream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);

      setRecording(true);
      startTimer();
    } catch (err: any) {
      setError(err.message || "Screen capture permission denied or stream dismissed.");
    }
  };

  const handleStop = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setRecording(false);
    stopTimer();
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `screen_capture_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSuccess(true);
  };

  const handleReset = () => {
    setVideoUrl(null);
    setDuration(0);
    setSuccess(false);
    setError("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          {recording && (
            <span className="absolute -inset-2 rounded-full bg-red-500/10 animate-ping" />
          )}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-sm transition-all ${
              recording
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-500"
                : "bg-zinc-50 dark:bg-zinc-950 border-zinc-250 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Video className="w-7 h-7" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {recording ? "Recording Your Screen..." : "Screen Capture Deck"}
          </h3>
          <p className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50 mt-1.5">
            {formatTime(duration)}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          {!recording ? (
            !videoUrl ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-xs font-mono font-bold transition-all shadow-sm focus:outline-none cursor-pointer"
              >
                <Video className="w-4 h-4" />
                CAPTURE DESKTOP
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-mono font-bold transition-all shadow-sm focus:outline-none cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD VIDEO
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  START OVER
                </button>
              </div>
            )
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-mono font-bold transition-all shadow-sm focus:outline-none cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              STOP RECORDING
            </button>
          )}
        </div>

        {videoUrl && !recording && (
          <div className="w-full max-w-sm border border-zinc-150 dark:border-zinc-800 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950">
            <video src={videoUrl} controls className="w-full rounded h-44 outline-none bg-black" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30 text-center">
          {error}
        </p>
      )}

      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium max-w-md mx-auto justify-center">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Screen capture compiled and downloaded successfully!</span>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed locally on your device with display-layer security.</span>
      </div>
    </div>
  );
}
