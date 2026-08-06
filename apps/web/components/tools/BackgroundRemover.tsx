"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Eraser, 
  Upload, 
  CheckCircle, 
  Lock, 
  Pipette, 
  SlidersHorizontal, 
  Download, 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Check, 
  Info,
  RefreshCw,
  Undo,
  Cpu,
  AlertTriangle,
  Columns,
  Split,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Helper for color distance in normalized RGB space
function getColorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  ) / Math.sqrt(255 * 255 * 3); // Normalizes distance to 0 - 1
}

export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [mode, setMode] = useState<"ai" | "chroma">("ai");
  const [modelQuality, setModelQuality] = useState<"small" | "medium">("small");
  
  // AI States
  const [aiPreview, setAiPreview] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiProgress, setAiProgress] = useState<{ stage: string; percent: number }>({ stage: "", percent: 0 });
  const [aiError, setAiError] = useState<string>("");
  
  // Chroma Keying States
  const [selectedColor, setSelectedColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [tolerance, setTolerance] = useState<number>(18);
  const [feather, setFeather] = useState<number>(4);
  const [contiguous, setContiguous] = useState<boolean>(true);
  const [lastClickedSeed, setLastClickedSeed] = useState<{ x: number; y: number } | null>(null);

  const [compareMode, setCompareMode] = useState<"slider" | "side" | "single" | "original">("slider");
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Auto-detect background color on image load by sampling outer corners
  useEffect(() => {
    if (!preview) return;
    
    const img = new Image();
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      
      // Sample 4 corners
      const corners = [
        ctx.getImageData(0, 0, 1, 1).data,
        ctx.getImageData(w - 1, 0, 1, 1).data,
        ctx.getImageData(0, h - 1, 1, 1).data,
        ctx.getImageData(w - 1, h - 1, 1, 1).data
      ];
      
      // Calculate average corner color as the auto-background seed
      const r = Math.round((corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4);
      const g = Math.round((corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4);
      const b = Math.round((corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4);
      
      setSelectedColor({ r, g, b });
      setLastClickedSeed(null); // Reset clicked seed on new image
    };
    img.src = preview;
  }, [preview]);

  // 2. Perform pixel processing and redraw canvas in real time (for chroma mode)
  useEffect(() => {
    if (mode !== "chroma" || !preview || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      // Max size limit for crisp, fast-rendering exports
      const maxDim = 1200;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.floor((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.floor((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const targetR = selectedColor.r;
      const targetG = selectedColor.g;
      const targetB = selectedColor.b;

      const tolPct = tolerance / 100;
      const featherPct = feather / 100;

      if (contiguous) {
        // High-performance BFS Contiguous Flood Fill algorithm
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        // Determine starting seed coordinates for flood fill
        const seeds: { x: number; y: number }[] = [];
        if (lastClickedSeed) {
          // If clicked manually, seed directly at user coordinates
          const scaledX = Math.min(w - 1, Math.max(0, Math.floor((lastClickedSeed.x / 100) * w)));
          const scaledY = Math.min(h - 1, Math.max(0, Math.floor((lastClickedSeed.y / 100) * h)));
          seeds.push({ x: scaledX, y: scaledY });
        } else {
          // Auto Mode: Seed all 4 edges to cleanly clear surrounding backgrounds
          for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 15))) {
            seeds.push({ x, y: 0 });
            seeds.push({ x, y: h - 1 });
          }
          for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 15))) {
            seeds.push({ x: 0, y });
            seeds.push({ x: w - 1, y });
          }
        }

        // Initialize flood queue
        for (const s of seeds) {
          const idx = s.y * w + s.x;
          if (idx >= 0 && idx < w * h) {
            visited[idx] = 1;
            queue.push(idx);
          }
        }

        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const cx = curr % w;
          const cy = Math.floor(curr / w);

          const neighbors = [
            { x: cx + 1, y: cy },
            { x: cx - 1, y: cy },
            { x: cx, y: cy + 1 },
            { x: cx, y: cy - 1 },
          ];

          for (const n of neighbors) {
            if (n.x >= 0 && n.x < w && n.y >= 0 && n.y < h) {
              const nIdx = n.y * w + n.x;
              if (!visited[nIdx]) {
                const npIdx = nIdx * 4;
                const nr = data[npIdx];
                const ng = data[npIdx + 1];
                const nb = data[npIdx + 2];

                const dist = getColorDistance(nr, ng, nb, targetR, targetG, targetB);

                // Queue pixels within threshold of selected background color group
                if (dist < tolPct + featherPct) {
                  visited[nIdx] = 1;
                  queue.push(nIdx);
                }
              }
            }
          }
        }

        // Apply alpha masking and feathering parameters
        for (let i = 0; i < w * h; i++) {
          if (visited[i]) {
            const pIdx = i * 4;
            const r = data[pIdx];
            const g = data[pIdx + 1];
            const b = data[pIdx + 2];

            const dist = getColorDistance(r, g, b, targetR, targetG, targetB);

            if (dist < tolPct) {
              data[pIdx + 3] = 0; // Cut background out completely
            } else if (dist < tolPct + featherPct) {
              // Smooth, anti-aliased feather transitions
              const ratio = (dist - tolPct) / featherPct;
              data[pIdx + 3] = Math.floor(ratio * 255);
            }
          }
        }
      } else {
        // Global color keying mode (removes matching colors globally)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dist = getColorDistance(r, g, b, targetR, targetG, targetB);

          if (dist < tolPct) {
            data[i + 3] = 0;
          } else if (dist < tolPct + featherPct) {
            const ratio = (dist - tolPct) / featherPct;
            data[i + 3] = Math.floor(ratio * 255);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setIsProcessing(false);
    };
    img.src = preview;
  }, [preview, selectedColor, tolerance, feather, contiguous, lastClickedSeed, mode, compareMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (!f.type.startsWith("image/")) return;

    setFile(f);
    setCompareMode("slider");
    setAiPreview("");
    setAiProgress({ stage: "", percent: 0 });
    setAiError("");

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleAIRemoval = async () => {
    if (!file) return;
    setAiLoading(true);
    setAiError("");
    setAiProgress({ stage: "Bootstrapping browser sandbox...", percent: 0 });

    try {
      const imglyModule = await import("@imgly/background-removal");
      
      let removeBackground: any = null;
      if (typeof imglyModule === "function") {
        removeBackground = imglyModule;
      } else if (imglyModule && typeof imglyModule.default === "function") {
        removeBackground = imglyModule.default;
      } else if (imglyModule && imglyModule.default && typeof (imglyModule.default as any).default === "function") {
        removeBackground = (imglyModule.default as any).default;
      } else if (imglyModule && typeof (imglyModule as any).removeBackground === "function") {
        removeBackground = (imglyModule as any).removeBackground;
      } else if (imglyModule && imglyModule.default && typeof (imglyModule.default as any).removeBackground === "function") {
        removeBackground = (imglyModule.default as any).removeBackground;
      }

      if (!removeBackground && imglyModule) {
        for (const key of Object.keys(imglyModule)) {
          if (typeof (imglyModule as any)[key] === "function") {
            removeBackground = (imglyModule as any)[key];
            break;
          }
        }
      }
      if (!removeBackground && imglyModule && imglyModule.default) {
        for (const key of Object.keys(imglyModule.default)) {
          if (typeof (imglyModule.default as any)[key] === "function") {
            removeBackground = (imglyModule.default as any)[key];
            break;
          }
        }
      }

      if (typeof removeBackground !== "function") {
        throw new Error("Could not resolve removeBackground function from @imgly/background-removal. Please try Precision Chroma mode.");
      }
      
      const resultBlob = await removeBackground(file, {
        model: modelQuality,
        progress: (key: string, current: number, total: number) => {
          let stage = "Synthesizing image...";
          if (key.includes("fetch")) {
            stage = `Downloading model resources (${modelQuality === "small" ? "~3MB" : "~15MB"})...`;
          } else if (key.includes("compute") || key.includes("onnx")) {
            stage = "Segmenting foreground boundaries...";
          }
          
          let percent = 0;
          if (total && total > 0) {
            percent = Math.round((current / total) * 100);
          } else {
            percent = Math.min(95, Math.round(current * 100));
          }
          setAiProgress({ stage, percent });
        }
      });

      const url = URL.createObjectURL(resultBlob);
      setAiPreview(url);
    } catch (err: any) {
      console.error("AI removal error:", err);
      setAiError(err?.message || "Local AI background removal failed. Try switching to manual Chroma mode.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.floor((pctX / 100) * canvas.width);
    const y = Math.floor((pctY / 100) * canvas.height);

    // Create a temporary sampler to read original pixel colors from source image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const img = new Image();
    img.onload = () => {
      tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pixel = tempCtx.getImageData(x, y, 1, 1).data;
      setSelectedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      setLastClickedSeed({ x: pctX, y: pctY });
    };
    img.src = preview;
  };

  const handleResetToAuto = () => {
    if (!preview) return;
    const img = new Image();
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const corners = [
        ctx.getImageData(0, 0, 1, 1).data,
        ctx.getImageData(w - 1, 0, 1, 1).data,
        ctx.getImageData(0, h - 1, 1, 1).data,
        ctx.getImageData(w - 1, h - 1, 1, 1).data
      ];
      
      const r = Math.round((corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4);
      const g = Math.round((corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4);
      const b = Math.round((corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4);
      
      setSelectedColor({ r, g, b });
      setLastClickedSeed(null);
    };
    img.src = preview;
  };

  const handleDownload = () => {
    if (mode === "ai" && aiPreview) {
      const a = document.createElement("a");
      a.href = aiPreview;
      a.download = `isolated_ai_${file?.name.substring(0, file.name.lastIndexOf(".")) || "result"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (mode === "chroma" && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `isolated_chroma_${file?.name.substring(0, file.name.lastIndexOf(".")) || "result"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const hexColor = `#${selectedColor.r.toString(16).padStart(2, "0")}${selectedColor.g.toString(16).padStart(2, "0")}${selectedColor.b.toString(16).padStart(2, "0")}`;

  return (
    <div id="bg-remover-root" className="space-y-6 font-sans">
      {!file ? (
        <div id="bg-upload-zone" className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 text-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative">
          <input
            id="bg-file-upload-input"
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
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Clean and fast background remover. Use local WebAssembly AI or high-precision Chroma masking.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div id="bg-processing-box" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6">
          
          {/* Top Panel Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
            <div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate max-w-xs">
                {file.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded uppercase font-mono">
                  {mode === "ai" ? "Smart AI Mode" : "Manual Chroma Mode"}
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs text-zinc-400">100% Free &amp; Offline</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Mode Selector */}
              <div className="bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg flex gap-0.5">
                <button
                  onClick={() => setMode("ai")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mode === "ai"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Local AI
                </button>
                <button
                  onClick={() => setMode("chroma")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mode === "chroma"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  <Pipette className="w-3 h-3 inline mr-1" />
                  Precision Chroma
                </button>
              </div>

              {/* Compare toggle only if in result state or processed */}
              {((mode === "ai" && aiPreview) || mode === "chroma") && (
                <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs gap-0.5">
                  <button
                    onClick={() => setCompareMode("slider")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      compareMode === "slider" ? "bg-white dark:bg-zinc-700 font-semibold shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                    title="Interactive Split Slider"
                  >
                    <Split className="w-3 h-3" />
                    <span className="hidden sm:inline">Split Slider</span>
                  </button>
                  <button
                    onClick={() => setCompareMode("side")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      compareMode === "side" ? "bg-white dark:bg-zinc-700 font-semibold shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                    title="Side-by-Side Comparison"
                  >
                    <Columns className="w-3 h-3" />
                    <span className="hidden sm:inline">Side-by-Side</span>
                  </button>
                  <button
                    onClick={() => setCompareMode("single")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      compareMode === "single" ? "bg-white dark:bg-zinc-700 font-semibold shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                    title="Isolated Output Only"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:inline">Isolated</span>
                  </button>
                  <button
                    onClick={() => setCompareMode("original")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      compareMode === "original" ? "bg-white dark:bg-zinc-700 font-semibold shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                    title="Original Image Only"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">Original</span>
                  </button>
                </div>
              )}

              <button
                id="reset-bg-remover"
                onClick={() => {
                  setFile(null);
                  setPreview("");
                  setAiPreview("");
                  setAiProgress({ stage: "", percent: 0 });
                }}
                className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline focus:outline-none cursor-pointer px-2"
              >
                Reset Image
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Interactive Image Workspace */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center border border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl p-6 relative overflow-hidden group min-h-[380px]">
              
              {/* Checkerboard Backdrop (Only visible in transparent/isolated areas) */}
              <div
                className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#000 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%)",
                  backgroundPosition: "0 0, 8px 8px",
                  backgroundSize: "16px 16px",
                }}
              />

              <div className="relative z-10 w-full flex flex-col items-center justify-center">
                {mode === "ai" ? (
                  /* AI Mode Workspace */
                  <div className="w-full flex flex-col items-center">
                    {!aiPreview ? (
                      /* Before AI Processing: Show the original source image and run button */
                      <div className="w-full flex flex-col items-center space-y-4">
                        <div className="relative max-h-[320px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt="Original Source Preview"
                            className="max-h-[320px] max-w-full object-contain block select-none pointer-events-none"
                          />
                        </div>
                        
                        <div className="w-full max-w-sm text-center space-y-3">
                          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Ready to Erase Background
                          </h4>
                          <p className="text-xs text-zinc-400">
                            Click below to run our offline browser-local WebAssembly AI model.
                          </p>

                          {aiLoading ? (
                            <div className="space-y-3 bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-zinc-500 font-medium truncate max-w-[70%]">
                                  {aiProgress.stage || "Initializing..."}
                                </span>
                                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">
                                  {aiProgress.percent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 transition-all duration-300"
                                  style={{ width: `${aiProgress.percent}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={handleAIRemoval}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
                            >
                              <Wand2 className="w-4 h-4 animate-pulse" />
                              Run Local AI Eraser
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* AI Processed Comparisons */
                      <div className="w-full flex flex-col items-center">
                        {compareMode === "slider" && (
                          <div className="relative max-h-[380px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-white select-none">
                            {/* Bottom: Original background */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt="Original source background"
                              className="max-h-[380px] max-w-full object-contain block pointer-events-none"
                            />

                            {/* Top: Isolated foreground */}
                            <div
                              className="absolute inset-0 bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]"
                              style={{
                                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={aiPreview}
                                alt="AI isolated foreground"
                                className="w-full h-full object-contain block pointer-events-none"
                              />
                            </div>

                            {/* Divider Line and Handle Overlay */}
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center">
                              <div
                                className="absolute top-0 bottom-0 w-[2.5px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.55)]"
                                style={{ left: `${sliderPosition}%` }}
                              >
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-zinc-200 flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                                  <div className="flex gap-[2px] items-center">
                                    <div className="w-[1.5px] h-3.5 bg-zinc-400 rounded-full" />
                                    <div className="w-[1.5px] h-3.5 bg-zinc-400 rounded-full" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Visual Indicator Labels */}
                            <span className="text-[10px] font-bold bg-indigo-600/90 text-white px-2 py-0.5 rounded shadow-sm absolute left-3 top-3 pointer-events-none uppercase tracking-wider font-mono">
                              Transparent
                            </span>
                            <span className="text-[10px] font-bold bg-zinc-900/80 text-white px-2 py-0.5 rounded shadow-sm absolute right-3 top-3 pointer-events-none uppercase tracking-wider font-mono">
                              Original
                            </span>

                            {/* Range Slider for dragging */}
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={sliderPosition}
                              onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 pointer-events-auto"
                            />
                          </div>
                        )}

                        {compareMode === "side" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-2">Original</span>
                              <div className="relative max-h-[280px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Original" className="max-h-[280px] object-contain block" />
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider font-mono mb-2">Isolated (Transparent)</span>
                              <div className="relative max-h-[280px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={aiPreview} alt="AI output" className="max-h-[280px] object-contain block" />
                              </div>
                            </div>
                          </div>
                        )}

                        {compareMode === "single" && (
                          <div className="relative max-h-[380px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={aiPreview}
                              alt="AI isolated"
                              className="max-h-[380px] max-w-full object-contain block"
                            />
                          </div>
                        )}

                        {compareMode === "original" && (
                          <div className="relative max-h-[380px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt="Original source"
                              className="max-h-[380px] max-w-full object-contain block"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chroma Key Workspace */
                  <div className="w-full flex flex-col items-center">
                    {compareMode === "slider" && (
                      <div className="relative max-h-[380px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-white select-none">
                        {/* Bottom Layer: Original Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt="Original background"
                          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none z-0"
                        />

                        {/* Top Layer: Transparent Chroma Canvas */}
                        <canvas
                          id="bg-interactive-canvas"
                          ref={canvasRef}
                          onClick={handleImageClick}
                          className="relative z-10 max-h-[380px] max-w-full cursor-crosshair object-contain block"
                          style={{
                            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                          }}
                        />

                        {/* Slider Handle Overlay */}
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center">
                          <div
                            className="absolute top-0 bottom-0 w-[2.5px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.55)]"
                            style={{ left: `${sliderPosition}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-zinc-200 flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                              <div className="flex gap-[2px] items-center">
                                <div className="w-[1.5px] h-3.5 bg-zinc-400 rounded-full" />
                                <div className="w-[1.5px] h-3.5 bg-zinc-400 rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Visual Indicator Labels */}
                        <span className="text-[10px] font-bold bg-indigo-600/90 text-white px-2 py-0.5 rounded shadow-sm absolute left-3 top-3 pointer-events-none uppercase tracking-wider font-mono">
                          Transparent
                        </span>
                        <span className="text-[10px] font-bold bg-zinc-900/80 text-white px-2 py-0.5 rounded shadow-sm absolute right-3 top-3 pointer-events-none uppercase tracking-wider font-mono">
                          Original
                        </span>

                        {/* Range Slider for dragging */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderPosition}
                          onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 pointer-events-auto"
                        />
                      </div>
                    )}

                    {compareMode === "side" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-2">Original</span>
                          <div className="relative max-h-[280px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt="Original" className="max-h-[280px] object-contain block" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider font-mono mb-2">Isolated (Transparent)</span>
                          <div className="relative max-h-[280px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]">
                            <canvas
                              ref={canvasRef}
                              onClick={handleImageClick}
                              className="max-h-[280px] max-w-full cursor-crosshair object-contain block"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {compareMode === "single" && (
                      <div className="relative max-h-[380px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]">
                        <canvas
                          ref={canvasRef}
                          onClick={handleImageClick}
                          className="max-h-[380px] max-w-full cursor-crosshair object-contain block"
                        />
                      </div>
                    )}

                    {compareMode === "original" && (
                      <div className="relative max-h-[380px] max-w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt="Original un-processed"
                          className="max-h-[380px] max-w-full object-contain block"
                        />
                      </div>
                    )}

                    <p className="text-[11px] font-medium text-zinc-400 mt-4 text-center flex items-center gap-1.5 justify-center">
                      <Pipette className="w-3.5 h-3.5 text-indigo-500" />
                      {compareMode === "slider" 
                        ? "Drag the slider to compare, or switch to 'Isolated' view to sample colors accurately." 
                        : "Click anywhere on the isolated image to sample and target specific background colors."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Specifications Control Block */}
            <div className="lg:col-span-5 space-y-6">
              
              {mode === "ai" ? (
                /* AI Settings Block */
                <div className="space-y-4 border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    <span>AI Model Quality</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setModelQuality("small")}
                      disabled={aiLoading}
                      className={`p-2.5 text-left rounded-lg border text-xs flex flex-col gap-0.5 cursor-pointer transition-all ${
                        modelQuality === "small"
                          ? "border-indigo-500 bg-indigo-50/10 text-indigo-700 dark:text-indigo-400 font-medium"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-1">
                        High Speed
                        {modelQuality === "small" && <Check className="w-3 h-3 text-indigo-500" />}
                      </span>
                      <span className="text-[10px] text-zinc-400">Quick load (~3MB model)</span>
                    </button>

                    <button
                      onClick={() => setModelQuality("medium")}
                      disabled={aiLoading}
                      className={`p-2.5 text-left rounded-lg border text-xs flex flex-col gap-0.5 cursor-pointer transition-all ${
                        modelQuality === "medium"
                          ? "border-indigo-500 bg-indigo-50/10 text-indigo-700 dark:text-indigo-400 font-medium"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-1">
                        High Quality
                        {modelQuality === "medium" && <Check className="w-3 h-3 text-indigo-500" />}
                      </span>
                      <span className="text-[10px] text-zinc-400">Deep precision (~15MB model)</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-2 bg-indigo-50/20 dark:bg-indigo-950/10 p-3 rounded-lg text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      Runs completely locally using your browser&apos;s CPU/GPU sandbox. No cloud fees, completely private, and highly scalable.
                    </span>
                  </div>

                  {aiPreview && !aiLoading && (
                    <button
                      onClick={handleAIRemoval}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-run AI Isolation
                    </button>
                  )}
                </div>
              ) : (
                /* Chroma Controls */
                <div className="space-y-4 border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Chroma Selection</span>
                    </div>
                    <button
                      onClick={handleResetToAuto}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                      title="Auto-detect color by checking image corners again"
                    >
                      <Wand2 className="w-3 h-3" />
                      Auto-Detect
                    </button>
                  </div>

                  {/* Sampled Color Indicator */}
                  <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
                    <div
                      className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm"
                      style={{ backgroundColor: hexColor }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {lastClickedSeed ? "Manual Color Sampled" : "Auto Background Detected"}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 uppercase">
                        HEX: {hexColor} • RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
                      </p>
                    </div>
                  </div>

                  {/* Contiguous Toggle */}
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="space-y-0.5">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Contiguous Extraction
                      </label>
                      <p className="text-[10px] text-zinc-400">
                        Only removes background connected to the borders/selection.
                      </p>
                    </div>
                    <button
                      onClick={() => setContiguous(!contiguous)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        contiguous ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          contiguous ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Tolerance Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-500">Color Sensitivity:</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{tolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={tolerance}
                      onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Feather Edge Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-500">Edge Feather (Smooth):</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{feather}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={feather}
                      onChange={(e) => setFeather(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Instant sandbox status helper */}
              <div className="flex items-start gap-2 bg-indigo-50/30 dark:bg-indigo-950/10 p-3 rounded-lg border border-indigo-100/20 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  {mode === "ai" 
                    ? "Smart AI mode utilizes browser WASM neural networks for non-solid or photographic backdrops." 
                    : "Precision Chroma is high-performance pixel evaluation. Slide controls above to instantly adjust transparency."}
                </span>
              </div>

              {/* Error Display */}
              {aiError && mode === "ai" && (
                <div className="p-3 border border-red-250 bg-red-50/20 dark:bg-red-950/10 text-red-500 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Action Buttons */}
              {preview && (
                <button
                  id="download-processed-result"
                  onClick={handleDownload}
                  disabled={mode === "ai" && !aiPreview}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                    mode === "ai" && !aiPreview
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download Transparent PNG
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {mode === "ai" 
                ? (aiPreview ? "Smart AI isolation complete! Download your transparent file below." : "Ready to run local Smart AI. Click &apos;Run Local AI Eraser&apos; to isolate the foreground.") 
                : "Precision Chroma sandbox active. Click on background colors to instantly erase them."}
            </span>
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
