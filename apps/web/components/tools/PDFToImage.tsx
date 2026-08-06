"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Upload, CheckCircle, RefreshCw, Lock, Image as ImageIcon, Download, Eye, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import FeedbackWidget from "@/components/FeedbackWidget";

interface PdfPage {
  index: number;
  label: string;
}

// Dynamically load dependencies from CDN to support Next.js static output builds without bundle pollution
const loadScript = (id: string, src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

const loadDependencies = async (): Promise<{ pdfjsLib: any; JSZip: any }> => {
  await Promise.all([
    loadScript("pdfjs-lib-script", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"),
    loadScript("jszip-script", "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js")
  ]);
  const pdfjsLib = (window as any).pdfjsLib;
  if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
  const JSZip = (window as any).JSZip;
  return { pdfjsLib, JSZip };
};

export default function PDFToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [previews, setPreviews] = useState<{ [key: number]: string }>({});
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<"png" | "jpeg">("png");

  // Load States
  const [loading, setLoading] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Lightbox Modal
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string>("");
  const [loadingLightbox, setLoadingLightbox] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Load Lightbox Page Image
  useEffect(() => {
    if (lightboxIndex === null || !pdfDocRef.current) return;
    const activeIndex = lightboxIndex;

    let active = true;
    async function renderLightbox() {
      setLoadingLightbox(true);
      try {
        const page = await pdfDocRef.current.getPage(activeIndex + 1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport }).promise;
          if (active) {
            setLightboxUrl(canvas.toDataURL("image/png"));
          }
        }
      } catch (err) {
        console.error("Lightbox render failed:", err);
      } finally {
        if (active) {
          setLoadingLightbox(false);
        }
      }
    }

    renderLightbox();
    return () => {
      active = false;
      setLightboxUrl("");
    };
  }, [lightboxIndex]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (f.type !== "application/pdf") {
      setError("Please upload a valid PDF document.");
      return;
    }

    setFile(f);
    setError("");
    setSuccess(false);
    setPreviews({});
    setLoading(true);

    try {
      const { pdfjsLib } = await loadDependencies();
      const arrBuffer = await f.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({ data: arrBuffer });
      const pdfDoc = await loadingTask.promise;
      pdfDocRef.current = pdfDoc;

      const count = pdfDoc.numPages;
      setPageCount(count);

      const mappedPages: PdfPage[] = [];
      const initialSelected = new Set<number>();
      for (let i = 0; i < count; i++) {
        mappedPages.push({ index: i, label: `Page ${i + 1}` });
        initialSelected.add(i);
      }
      setPages(mappedPages);
      setSelectedPages(initialSelected);

      // Render previews in background asynchronously
      setLoadingPreviews(true);
      (async () => {
        for (let i = 0; i < count; i++) {
          // If file is reset during rendering, exit
          if (!pdfDocRef.current) break;
          try {
            const page = await pdfDoc.getPage(i + 1);
            const viewport = page.getViewport({ scale: 0.4 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext("2d");
            if (context) {
              context.fillStyle = "#ffffff";
              context.fillRect(0, 0, canvas.width, canvas.height);
              await page.render({ canvasContext: context, viewport }).promise;
              setPreviews((prev) => ({ ...prev, [i]: canvas.toDataURL("image/png") }));
            }
          } catch (err) {
            console.error(`Preview page ${i + 1} render failed:`, err);
          }
        }
        setLoadingPreviews(false);
      })();
    } catch (err: any) {
      setError("Failed to parse the PDF document structure. It may be corrupted or encrypted.");
      setFile(null);
      setPageCount(null);
    } finally {
      setLoading(false);
    }
  };

  const togglePageSelection = (index: number) => {
    setSelectedPages((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
    setSuccess(false);
  };

  const toggleSelectAll = () => {
    if (pageCount === null) return;
    setSelectedPages((prev) => {
      if (prev.size === pageCount) {
        return new Set();
      } else {
        const all = new Set<number>();
        for (let i = 0; i < pageCount; i++) {
          all.add(i);
        }
        return all;
      }
    });
    setSuccess(false);
  };

  const handleDownloadSingle = async (pageIdx: number) => {
    if (!file || !pdfDocRef.current) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const page = await pdfDocRef.current.getPage(pageIdx + 1);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Rendering canvas not found.");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to initialize canvas context.");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, 0.95);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${file.name.replace(".pdf", "")}_page_${pageIdx + 1}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to render or download page.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportZip = async () => {
    if (!file || !pdfDocRef.current || pageCount === null) return;
    
    const targetIndices = Array.from(selectedPages).sort((a, b) => a - b);
    if (targetIndices.length === 0) {
      setError("Please select at least one page to export.");
      return;
    }

    setBatchLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { JSZip } = await loadDependencies();
      if (!JSZip) throw new Error("Compression library failed to load.");

      const zip = new JSZip();
      const pdfDoc = pdfDocRef.current;

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Rendering canvas not found.");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to initialize context.");

      for (let i = 0; i < targetIndices.length; i++) {
        const pageIdx = targetIndices[i];
        setBatchProgress(`Rendering page ${pageIdx + 1} of ${targetIndices.length}...`);

        const page = await pdfDoc.getPage(pageIdx + 1);
        const viewport = page.getViewport({ scale: 2.0 }); // high-res
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        const base64Data = dataUrl.split(",")[1];

        const fileNumber = String(pageIdx + 1).padStart(3, "0");
        zip.file(`page_${fileNumber}.${format}`, base64Data, { base64: true });
      }

      setBatchProgress("Creating ZIP archive...");
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = `${file.name.replace(".pdf", "")}_extracted_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to batch export pages to ZIP.");
    } finally {
      setBatchLoading(false);
      setBatchProgress("");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {!file ? (
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 text-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 shadow-sm">
              {loading ? <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" /> : <Upload className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {loading ? "Loading rendering engine..." : "Upload Target PDF"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {loading ? "Parsing PDF page structure..." : "Convert PDF pages to stand-alone visual image files."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6">
          {/* File Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate max-w-[250px] sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount} pages detected
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPageCount(null);
                setPages([]);
                setPreviews({});
                setSelectedPages(new Set());
                setSuccess(false);
                pdfDocRef.current = null;
              }}
              className="text-xs text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-250 underline focus:outline-none cursor-pointer self-start sm:self-center"
            >
              Reset File
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
                  Export Format
                </label>
                <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-white dark:bg-zinc-900">
                  {(["png", "jpeg"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                        format === fmt
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {pageCount !== null && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
                    Page Selection
                  </span>
                  <button
                    onClick={toggleSelectAll}
                    className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
                  >
                    {selectedPages.size === pageCount ? "Deselect All" : "Select All"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">
                {selectedPages.size} of {pageCount} pages selected
              </span>
              <button
                onClick={handleExportZip}
                disabled={selectedPages.size === 0 || batchLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-transparent rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm focus:outline-none cursor-pointer"
              >
                {batchLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export ZIP ({selectedPages.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Batch Progress Banner */}
          {batchProgress && (
            <div className="flex items-center gap-3 px-4 py-3 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
              <span>{batchProgress}</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
              {error}
            </p>
          )}

          {success && (
            <>
              <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Export task completed successfully! Download triggered.</span>
              </div>
              <FeedbackWidget toolName="PDF to Image" />
            </>
          )}

          {/* Grid Page Previews */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Document Pages Preview {loadingPreviews && "• Rendering thumbnails..."}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p) => {
                const isSelected = selectedPages.has(p.index);
                const previewSrc = previews[p.index];

                return (
                  <div
                    key={p.index}
                    className={`group relative aspect-[3/4] border rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-all ${
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/10"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    {/* Render Thumbnail Image */}
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={p.label}
                        className="w-full h-full object-contain bg-white dark:bg-zinc-900"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                        <ImageIcon className="w-6 h-6 animate-pulse" />
                        <span className="text-[9px] font-mono mt-2 uppercase tracking-wide">Page {p.index + 1}</span>
                      </div>
                    )}

                    {/* Checkbox Selector Pin */}
                    <button
                      onClick={() => togglePageSelection(p.index)}
                      className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-transparent text-white"
                          : "bg-white/80 dark:bg-zinc-900/80 border-zinc-350 dark:border-zinc-750 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>

                    {/* Bottom Label Bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-zinc-950/70 border-t border-white/5 py-1 text-center backdrop-blur-[2px]">
                      <span className="text-[9px] font-mono font-bold text-white">
                        PAGE {p.index + 1}
                      </span>
                    </div>

                    {/* Hover Operations Overlay */}
                    {previewSrc && (
                      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5">
                        <button
                          onClick={() => setLightboxIndex(p.index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-zinc-900 text-[10px] font-bold transition-all transform translate-y-2 group-hover:translate-y-0 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(p.index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all transform translate-y-2 group-hover:translate-y-0 delay-75 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hidden Canvas used for high-fidelity export */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-fade-in">
          {/* Click outside to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => setLightboxIndex(null)} />

          <div className="relative max-w-4xl w-full max-h-[85vh] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-150 dark:border-zinc-800 overflow-hidden flex flex-col z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-mono font-bold text-zinc-500">
                Page {lightboxIndex + 1} of {pageCount} Previews
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadSingle(lightboxIndex)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {format.toUpperCase()}</span>
                </button>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-250 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-6 flex items-center justify-center min-h-[300px]">
              {loadingLightbox ? (
                <div className="flex flex-col items-center gap-2.5">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-xs font-mono text-zinc-500">Rendering page layout...</span>
                </div>
              ) : lightboxUrl ? (
                <img
                  src={lightboxUrl}
                  alt={`Page ${lightboxIndex + 1}`}
                  className="max-h-[60vh] object-contain shadow-md rounded border border-zinc-250 dark:border-zinc-850"
                />
              ) : null}
            </div>

            {/* Footer Navigation */}
            {pageCount !== null && pageCount > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  disabled={lightboxIndex === 0}
                  onClick={() => setLightboxIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : null))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-750 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs font-mono font-bold text-zinc-500">
                  {lightboxIndex + 1} / {pageCount}
                </span>
                <button
                  disabled={lightboxIndex === pageCount - 1}
                  onClick={() => setLightboxIndex((prev) => (prev !== null ? Math.min(pageCount - 1, prev + 1) : null))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-750 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 transition-all transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
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
