"use client";

import { useState, useRef } from "react";
import { Scissors, Upload, FileAudio, CheckCircle, RefreshCw, Lock, Play, Pause, Download } from "lucide-react";

export default function AudioCutter() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (!f.type.startsWith("audio/")) {
      setError("Please select a valid audio file (e.g. MP3, WAV).");
      return;
    }

    setFile(f);
    setError("");
    setSuccess(false);
    setTrimmedUrl(null);
    setLoading(true);

    try {
      const arrBuffer = await f.arrayBuffer();
      // Initialize browser AudioContext securely
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const decodedBuffer = await ctx.decodeAudioData(arrBuffer);
      audioBufferRef.current = decodedBuffer;

      const fileDuration = decodedBuffer.duration;
      setDuration(fileDuration);
      setStartTime(0);
      setEndTime(Math.min(fileDuration, 15)); // default cut first 15s or total length
    } catch (err) {
      setError("Failed to decode this audio file structure.");
    } finally {
      setLoading(false);
    }
  };

  // Convert audio buffer into a standard WAV blob completely locally in the client
  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // Write WAV header specifications
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // chunk length
    setUint16(1); // sample format (PCM)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([bufferArr], { type: "audio/wav" });
  };

  const handleCut = async () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const origBuffer = audioBufferRef.current;
      const ctx = audioContextRef.current;

      const rate = origBuffer.sampleRate;
      const startSample = Math.floor(startTime * rate);
      const endSample = Math.floor(endTime * rate);
      const frameCount = endSample - startSample;

      if (frameCount <= 0) {
        throw new Error("Invalid clipping bounds. End time must be greater than start time.");
      }

      // Create new clipped buffer
      const trimmedBuffer = ctx.createBuffer(
        origBuffer.numberOfChannels,
        frameCount,
        rate
      );

      // Copy buffer channel channels
      for (let c = 0; c < origBuffer.numberOfChannels; c++) {
        const origChan = origBuffer.getChannelData(c);
        const trimmedChan = trimmedBuffer.getChannelData(c);
        const sliced = origChan.subarray(startSample, endSample);
        trimmedChan.set(sliced);
      }

      const wavBlob = bufferToWav(trimmedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setTrimmedUrl(url);

      // Automatic download
      const a = document.createElement("a");
      a.href = url;
      a.download = `trimmed_${file?.name.substring(0, file.name.lastIndexOf(".")) || "clip"}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during audio clipping operations.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${parseFloat(secs) < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="space-y-6 font-sans">
      {!file ? (
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 text-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Upload Target Audio Track
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Supports MP3, WAV, FLAC, and OGG. Trimming is processed entirely in the browser.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <FileAudio className="w-8 h-8 text-indigo-500" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Track length: {formatTime(duration)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setTrimmedUrl(null);
                setSuccess(false);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline focus:outline-none cursor-pointer"
            >
              Reset Track
            </button>
          </div>

          <div className="space-y-6">
            {/* Visual crop sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase font-semibold">Clip Start:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatTime(startTime)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStartTime(Math.min(val, endTime - 0.1));
                    setSuccess(false);
                  }}
                  className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase font-semibold">Clip End:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatTime(endTime)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEndTime(Math.max(val, startTime + 0.1));
                    setSuccess(false);
                  }}
                  className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {trimmedUrl && (
              <div className="p-4 border border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/20 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Clipped Audio Preview</p>
                <audio src={trimmedUrl} controls className="w-full h-10 outline-none" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
              {error}
            </p>
          )}

          {success && (
            <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Audio track trimmed successfully! Wav asset download triggered.</span>
            </div>
          )}

          <button
            onClick={handleCut}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Slicing binary PCM channels...
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                Cut and Export WAV
              </>
            )}
          </button>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed locally on your device with offline WAV rendering.</span>
      </div>
    </div>
  );
}
