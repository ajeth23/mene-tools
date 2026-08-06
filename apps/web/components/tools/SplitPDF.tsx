"use client";

import { useState, useEffect, useRef } from "react";
import { Scissors, Upload, FileText, CheckCircle, RefreshCw, Lock, Image as ImageIcon, Check } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { getPdfDoc, renderPdfPageDataUrl } from "@/lib/pdf-utils";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeStr, setRangeStr] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previews, setPreviews] = useState<{ [key: number]: string }>({});
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const pdfDocRef = useRef<any>(null);

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
    setSelectedPages(new Set());
    setLoadingPreviews(true);

    try {
      const pdfDoc = await getPdfDoc(f);
      pdfDocRef.current = pdfDoc;
      const count = pdfDoc.numPages;
      setPageCount(count);
      setRangeStr(`1-${count}`);

      // Select all by default
      const initialSelected = new Set<number>();
      for (let i = 0; i < count; i++) {
        initialSelected.add(i);
      }
      setSelectedPages(initialSelected);

      // Render previews in background
      (async () => {
        for (let i = 0; i < count; i++) {
          if (!pdfDocRef.current) break;
          try {
            const dataUrl = await renderPdfPageDataUrl(pdfDoc, i + 1, 0.4);
            setPreviews((prev) => ({ ...prev, [i]: dataUrl }));
          } catch (err) {
            console.error(`Preview page ${i + 1} render failed:`, err);
          }
        }
        setLoadingPreviews(false);
      })();
    } catch (err) {
      setError("Failed to parse this PDF document.");
      setPageCount(null);
      setLoadingPreviews(false);
    }
  };

  const parseRanges = (str: string, total: number): number[] => {
    const indices: number[] = [];
    const parts = str.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (/^\d+$/.test(trimmed)) {
        const val = parseInt(trimmed, 10);
        if (val >= 1 && val <= total) {
          indices.push(val - 1);
        }
      } else if (/^\d+-\d+$/.test(trimmed)) {
        const [startStr, endStr] = trimmed.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (start <= end && start >= 1 && end <= total) {
          for (let i = start; i <= end; i++) {
            indices.push(i - 1);
          }
        }
      }
    }

    return Array.from(new Set(indices)).sort((a, b) => a - b);
  };

  const formatRanges = (pagesArr: number[]): string => {
    if (pagesArr.length === 0) return "";
    const ranges: string[] = [];
    let start = pagesArr[0];
    let end = pagesArr[0];

    for (let i = 1; i < pagesArr.length; i++) {
      if (pagesArr[i] === end + 1) {
        end = pagesArr[i];
      } else {
        if (start === end) {
          ranges.push(`${start + 1}`);
        } else {
          ranges.push(`${start + 1}-${end + 1}`);
        }
        start = pagesArr[i];
        end = pagesArr[i];
      }
    }
    if (start === end) {
      ranges.push(`${start + 1}`);
    } else {
      ranges.push(`${start + 1}-${end + 1}`);
    }
    return ranges.join(", ");
  };

  const handleRangeTextChange = (val: string) => {
    setRangeStr(val);
    if (pageCount !== null) {
      const parsed = parseRanges(val, pageCount);
      setSelectedPages(new Set(parsed));
    }
  };

  const togglePageSelection = (index: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      const sorted = Array.from(next).sort((a, b) => a - b);
      setRangeStr(formatRanges(sorted));
      return next;
    });
    setSuccess(false);
  };

  const handleSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || pageCount === null) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const targetIndices = parseRanges(rangeStr, pageCount);
      if (targetIndices.length === 0) {
        throw new Error("No valid pages selected. Make sure page indexes are within bounds.");
      }

      const fileBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(fileBuffer);
      const splitDoc = await PDFDocument.create();

      const copiedPages = await splitDoc.copyPages(srcDoc, targetIndices);
      copiedPages.forEach((page) => splitDoc.addPage(page));

      const pdfBytes = await splitDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during local PDF splitting.");
    } finally {
      setLoading(false);
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
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Upload Target PDF
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload a single PDF file to extract page ranges.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-500" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate max-w-xs sm:max-w-md">
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
                setRangeStr("");
                setSelectedPages(new Set());
                setPreviews({});
                setSuccess(false);
                pdfDocRef.current = null;
              }}
              className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline focus:outline-none cursor-pointer"
            >
              Reset File
            </button>
          </div>

          <form onSubmit={handleSplit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                Page Selection Formula
              </label>
              <input
                type="text"
                value={rangeStr}
                onChange={(e) => handleRangeTextChange(e.target.value)}
                placeholder="e.g. 1, 3-5, 7"
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50"
              />
              <p className="text-[11px] text-zinc-400">
                Use checkboxes on the page thumbnails below to select pages visually, or type directly in the formula input above.
              </p>
            </div>

            {/* Document Pages Preview Grid */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Select Pages Visually {loadingPreviews && "• Rendering..."}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: pageCount || 0 }, (_, i) => {
                  const isSelected = selectedPages.has(i);
                  const previewSrc = previews[i];

                  return (
                    <div
                      key={i}
                      onClick={() => togglePageSelection(i)}
                      className={`group relative aspect-[3/4] border rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-all cursor-pointer select-none ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/10"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {/* Preview Image */}
                      {previewSrc ? (
                        <img
                          src={previewSrc}
                          alt={`Page ${i + 1}`}
                          className="w-full h-full object-contain bg-white dark:bg-zinc-900"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                          <ImageIcon className="w-6 h-6 animate-pulse" />
                          <span className="text-[9px] font-mono mt-2 uppercase tracking-wide">Page {i + 1}</span>
                        </div>
                      )}

                      {/* Checkbox badge */}
                      <div
                        className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-transparent text-white"
                            : "bg-white/80 dark:bg-zinc-900/80 border-zinc-300 dark:border-zinc-700 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>

                      {/* Page Tag */}
                      <div className="absolute bottom-0 inset-x-0 bg-zinc-950/70 border-t border-white/5 py-1 text-center backdrop-blur-[2px]">
                        <span className="text-[9px] font-mono font-bold text-white">
                          PAGE {i + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                  <span>PDF pages extracted successfully! Download triggered.</span>
                </div>
                <FeedbackWidget toolName="Split PDF" />
              </>
            )}

            <button
              type="submit"
              disabled={loading || selectedPages.size === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Extracting pages...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  <span>Split and Download Selected ({selectedPages.size})</span>
                </>
              )}
            </button>
          </form>
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
